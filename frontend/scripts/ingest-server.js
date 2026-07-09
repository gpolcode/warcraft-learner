/**
 * Ingest file server: the one process with filesystem access while the browser app
 * ingests (npm run start:ingest / npm run ingest). A dumb file store over
 * frontend/public/data/** - save, delete, list and load, nothing else. Every piece of
 * ingestion logic (signatures, versioning, ordering, transforms) lives in the Angular
 * app; this server must never grow any.
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;
const DATA_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/data');
// Position payloads reach tens of MB; express's default 100kb body cap would reject them.
const BODY_LIMIT = '200mb';

// Monotonic suffix so two concurrent writes to the same path never collide on the temp name.
let tempWriteCounter = 0;

/**
 * Resolve a client-supplied relative path inside DATA_ROOT, or null when its `..`
 * segments would escape the root - no request may read or write outside the data folder.
 */
function resolveContained(relPath) {
  if (typeof relPath !== 'string' || relPath.length === 0) return null;
  const full = path.resolve(DATA_ROOT, relPath);
  if (full !== DATA_ROOT && !full.startsWith(DATA_ROOT + path.sep)) return null;
  return full;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: BODY_LIMIT }));

app.post('/api/save', async (req, res) => {
  const { filePath, data } = req.body ?? {};
  const full = resolveContained(filePath);
  if (!full || data === undefined) return res.status(400).json({ error: 'filePath and data are required' });
  try {
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    // Minified + temp-then-rename: the bench data is machine-read across thousands of
    // files (minifying cuts the footprint ~70%), and a kill mid-write must leave the
    // previous complete file, not a truncated one.
    const tmp = `${full}.${process.pid}.${tempWriteCounter++}.tmp`;
    try {
      await fs.promises.writeFile(tmp, JSON.stringify(data) + '\n');
      await fs.promises.rename(tmp, full);
    } catch (err) {
      await fs.promises.rm(tmp, { force: true });
      throw err;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/delete', async (req, res) => {
  const full = resolveContained(req.body?.filePath);
  if (!full) return res.status(400).json({ error: 'filePath is required' });
  try {
    await fs.promises.rm(full, { force: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/list', async (req, res) => {
  const full = resolveContained(req.query.dir);
  if (!full) return res.status(400).json({ error: 'dir is required' });
  try {
    res.json({ entries: (await fs.promises.readdir(full)).sort() });
  } catch (err) {
    // An absent directory is a legitimate empty listing (first run of a spec).
    if (err.code === 'ENOENT') return res.json({ entries: [] });
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/load', async (req, res) => {
  const full = resolveContained(req.query.filePath);
  if (!full) return res.status(400).json({ error: 'filePath is required' });
  try {
    const content = await fs.promises.readFile(full, 'utf8');
    res.type('application/json').send(content);
  } catch (err) {
    // An exact 404 is the contract: the transport maps it to the `missing` load state.
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[ingest-server] file store for ${DATA_ROOT} listening on http://localhost:${PORT}`);
});
