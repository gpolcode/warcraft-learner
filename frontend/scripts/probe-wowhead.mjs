#!/usr/bin/env node
// Diagnostic probe for Wowhead icon/name resolution transports.
//
// Why this exists: the in-app `wl-game-icon` resolver fetches Wowhead through a
// public CORS proxy, and when it fails the error is best-effort-swallowed, so we
// never see why. This script hits each candidate transport directly and prints
// the HTTP status, a body snippet, and whether a name+icon can be extracted -
// turning "it does not work" into a deterministic answer about which transport
// returns parseable data and in what shape.
//
// Caveat: Node has no CORS, so a transport that works here can still be blocked
// in the browser by a missing Access-Control-Allow-Origin header. The browser
// devtools snippet in the plan is the final arbiter for CORS; this probe is for
// discovering the response SHAPE quickly and offline-of-the-app.
//
// Usage:  node frontend/scripts/probe-wowhead.mjs [itemId] [enchantSpellId]
// Default ids: item 260312 (Gaze of the Alnseer), spell 121471 (Shadow Blades).

const ITEM_ID = Number(process.argv[2]) || 260312;
const SPELL_ID = Number(process.argv[3]) || 121471;

const SNIPPET = 300;

// Strip a JSONP wrapper like `itemTooltip({...})` down to the inner JSON.
function unwrapJsonp(body) {
  const match = body.match(/^\s*[a-zA-Z_$][\w$]*\s*\((.*)\)\s*;?\s*$/s);
  return match ? match[1] : body;
}

// Best-effort name+icon extraction that does not depend on a DOM. Handles both
// Wowhead XML (`<name><![CDATA[..]]></name>`, `<icon ...>file</icon>`) and the
// tooltip JSON shape (`{"name":"..","icon":".."}`).
function extract(body) {
  const text = unwrapJsonp(body);
  // JSON shape first.
  try {
    const json = JSON.parse(text);
    if (json && (json.name || json.icon)) {
      return { name: json.name ?? '', icon: json.icon ?? '', via: 'json' };
    }
  } catch {
    // not JSON - fall through to XML scraping
  }
  const name =
    text.match(/<name[^>]*>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*<\/name>/s)?.[1]?.trim() ?? '';
  const icon =
    text.match(/<icon[^>]*>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*<\/icon>/s)?.[1]?.trim() ?? '';
  if (name || icon) return { name, icon, via: 'xml' };
  return null;
}

function looksLikeHtmlError(body) {
  const head = body.slice(0, 200).toLowerCase();
  return head.includes('<!doctype html') || head.includes('<html') || head.includes('cf-browser');
}

async function probe(label, url, { unwrapEnvelope = false } = {}) {
  const line = (msg) => console.log(`  ${msg}`);
  console.log(`\n=== ${label} ===`);
  console.log(`  URL: ${url}`);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'warcraft-learner-probe' } });
    let body = await res.text();
    console.log(`  HTTP ${res.status} ${res.statusText} | content-type: ${res.headers.get('content-type')}`);
    if (unwrapEnvelope) {
      try {
        const env = JSON.parse(body);
        line(`allorigins status.http_code: ${env?.status?.http_code}`);
        body = String(env?.contents ?? '');
      } catch {
        line('could not JSON-parse allorigins envelope');
      }
    }
    line(`body[0..${SNIPPET}]: ${JSON.stringify(body.slice(0, SNIPPET))}`);
    if (looksLikeHtmlError(body)) line('!! body looks like an HTML / challenge page, not data');
    const extracted = extract(body);
    if (extracted && (extracted.name || extracted.icon)) {
      console.log(`  WORKS: ${label} -> name=${JSON.stringify(extracted.name)} icon=${JSON.stringify(extracted.icon)} (${extracted.via})`);
    } else {
      console.log(`  FAIL: ${label} -> no name/icon extractable`);
    }
  } catch (err) {
    console.log(`  ERROR: ${label} -> ${err?.message ?? err}`);
  }
}

async function main() {
  console.log(`Probing Wowhead transports for item=${ITEM_ID}, spell=${SPELL_ID}`);

  const targets = [
    ['item', ITEM_ID],
    ['spell', SPELL_ID],
  ];

  for (const [kind, id] of targets) {
    const wowheadXml = `https://www.wowhead.com/${kind}=${id}?xml`;
    const tooltip = `https://nether.wowhead.com/tooltip/${kind}/${id}`;

    await probe(
      `allorigins /get + ${kind} XML`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(wowheadXml)}`,
      { unwrapEnvelope: true },
    );
    await probe(`allorigins /raw + ${kind} XML`, `https://api.allorigins.win/raw?url=${encodeURIComponent(wowheadXml)}`);
    await probe(`wowhead ${kind} XML direct`, wowheadXml);
    await probe(`nether tooltip ${kind} (JSON/JSONP)`, tooltip);
    await probe(`corsproxy.io + ${kind} XML`, `https://corsproxy.io/?url=${encodeURIComponent(wowheadXml)}`);
  }

  console.log('\nDone. The transport with a "WORKS:" line returning a real name+icon is the one to use.');
  console.log('Confirm it is not CORS-blocked by running the browser devtools snippet from the plan.');
}

main();
