// All ingestion logic (signatures, versioning, ordering, transforms) lives in the Angular app; this server must never grow any.
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import zlib from 'zlib';
import writeFileAtomic from 'write-file-atomic';
import { baseEnvironment } from '../src/environments/base-environment.ts';

const { appUrl, ingestServerUrl, wclResponseCacheDir } = baseEnvironment;
const PORT = Number(new URL(ingestServerUrl).port);
const FRONTEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_ROOT = path.join(FRONTEND_ROOT, 'public/data');
const CACHE_ROOT = wclResponseCacheDir ? path.resolve(FRONTEND_ROOT, wclResponseCacheDir) : null;
const CACHE_KEY = /^[0-9a-f]{64}$/;
const gzip = promisify(zlib.gzip);
// Position payloads reach tens of MB; express's default 100kb body cap would reject them.
const BODY_LIMIT = '200mb';

// A wildcard origin would let any site open in the dev's browser drive this unauthenticated, write-capable store.
const ALLOWED_ORIGINS = [appUrl, loopbackTwin(appUrl)];
// Reject any other Host so a rebound DNS name resolving to loopback cannot reach the store.
const ALLOWED_HOSTS = new Set([new URL(ingestServerUrl).host, loopbackTwin(new URL(ingestServerUrl).host)]);

// A re-bench served from stored WCL responses reads thousands a minute.
const REQUESTS_PER_MINUTE = 60_000;

// Browsers treat the two loopback spellings as different origins, and either may be the one typed into the address bar.
function loopbackTwin(address) {
  return address.replace('localhost', '127.0.0.1');
}

// A crafted path must never read or write outside the data root.
function resolveContained(segments) {
  const relPath = (segments ?? []).join('/');
  if (relPath.length === 0) return null;
  const full = path.resolve(DATA_ROOT, relPath);
  if (full !== DATA_ROOT && !full.startsWith(DATA_ROOT + path.sep)) return null;
  return full;
}

// Redundant with the key pattern, but the prefix check is the containment guard code scanning recognizes.
function cacheEntryPath(key) {
  if (!CACHE_KEY.test(key)) return null;
  const full = path.resolve(CACHE_ROOT, key.slice(0, 2), `${key}.json.gz`);
  return full.startsWith(CACHE_ROOT + path.sep) ? full : null;
}

const app = express();
app.use((req, res, next) => {
  if (!ALLOWED_HOSTS.has(req.headers.host)) return res.status(403).end();
  next();
});
app.use(rateLimit({ windowMs: 60_000, limit: REQUESTS_PER_MINUTE, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.text({ type: 'application/json', limit: BODY_LIMIT }));

app.put('/api/data/*path', async (req, res) => {
  const full = resolveContained(req.params.path);
  if (!full || typeof req.body !== 'string' || req.body.length === 0) {
    return res.status(400).json({ error: 'a contained path and a JSON body are required' });
  }
  try {
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    // Atomic write so a kill mid-write leaves the previous complete file.
    await writeFileAtomic(full, req.body + '\n');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/data/*path', async (req, res) => {
  const full = resolveContained(req.params.path);
  if (!full) return res.status(400).json({ error: 'a contained path is required' });
  try {
    const content = await fs.promises.readFile(full, 'utf8');
    res.type('application/json').send(content);
  } catch (err) {
    // An exact 404 is the contract: the transport maps it to the `missing` load state.
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/data/*path', async (req, res) => {
  const full = resolveContained(req.params.path);
  if (!full) return res.status(400).json({ error: 'a contained path is required' });
  try {
    await fs.promises.rm(full, { force: true });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/dirs/*path', async (req, res) => {
  const full = resolveContained(req.params.path);
  if (!full) return res.status(400).json({ error: 'a contained path is required' });
  try {
    res.json((await fs.promises.readdir(full)).sort());
  } catch (err) {
    // An absent directory is a legitimate empty listing (first run of a spec).
    if (err.code === 'ENOENT') return res.json([]);
    res.status(500).json({ error: String(err) });
  }
});

if (CACHE_ROOT) {
  app.get('/api/wcl-cache/:key', async (req, res) => {
    const full = cacheEntryPath(req.params.key);
    if (!full) return res.status(400).json({ error: 'a sha256 hex key is required' });
    try {
      const stored = await fs.promises.readFile(full);
      // The ingest workflow prunes by modification time, so a read marks the entry as still in use.
      const now = new Date();
      await fs.promises.utimes(full, now, now);
      res.set({ 'Content-Encoding': 'gzip', 'Cache-Control': 'no-store' }).type('application/json').send(stored);
    } catch (err) {
      if (err.code === 'ENOENT') return res.status(404).json({ error: 'not stored' });
      res.status(500).json({ error: String(err) });
    }
  });

  app.put('/api/wcl-cache/:key', async (req, res) => {
    const full = cacheEntryPath(req.params.key);
    if (!full || typeof req.body !== 'string' || req.body.length === 0) {
      return res.status(400).json({ error: 'a sha256 hex key and a JSON body are required' });
    }
    try {
      await fs.promises.mkdir(path.dirname(full), { recursive: true });
      await writeFileAtomic(full, await gzip(req.body));
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
}

// Express hands a failed bind (the port already taken) to this callback, so without the check a second server reports listening and serves nothing.
app.listen(PORT, '127.0.0.1', err => {
  if (err) {
    console.error(`[ingest-server] cannot listen on ${ingestServerUrl}: ${err.message}`);
    process.exit(1);
  }
  console.log(`[ingest-server] file store for ${DATA_ROOT} listening on ${ingestServerUrl}`);
  console.log(CACHE_ROOT ? `[ingest-server] WCL responses stored in ${CACHE_ROOT}` : '[ingest-server] WCL response store off');
});
