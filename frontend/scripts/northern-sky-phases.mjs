// Northern Sky's phase numbering is hand-authored per boss and does not line up with Warcraft Logs' phases, so it can only come from the addon's own source.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAW_ROOT = 'https://raw.githubusercontent.com/Reloe/NorthernSkyRaidTools/main/NorthernSkyRaidTools';
const TOC = 'NorthernSkyRaidTools.toc';
const TIMELINE_MANIFEST = 'BossTimelines/BossTimelines.xml';
const TARGET = fileURLToPath(new URL('../public/data/specs/northern-sky-phases.json', import.meta.url));

const ALERT_ENTRY = /^(EncounterAlerts[\\/][^\\/\s]+[\\/][^\\/\s]+\.lua)\s*$/gm;
const TIMELINE_ENTRY = /<Script\s+file="([^"]+\/[^"]+\.lua)"/g;
const ENCOUNTER_ID = /^\s*local encID\s*=\s*(\d+)/m;
const REGISTRATION = /NSI\.BossTimelines\[(\d+)\]\s*=\s*\{([\s\S]*?)\}/;
const MYTHIC_TABLE = /Mythic\s*=\s*(\w+)/;
const PHASE_ENTRY = /\[(\d+(?:\.\d+)?)\]\s*=\s*\{[^}]*start\s*=\s*(-?\d+(?:\.\d+)?)/g;

async function fetchText(path) {
  const response = await fetch(`${RAW_ROOT}/${path.replace(/\\/g, '/')}`);
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  return response.text();
}

// The .toc spells one file's name in a case the case-sensitive raw host cannot serve, so a miss skips that boss rather than failing the pull.
async function fetchOptionalText(path) {
  try {
    return await fetchText(path);
  } catch (cause) {
    console.error(`::warning::skipped ${path}: ${cause.message}`);
    return null;
  }
}

// A non-greedy match would stop at the first `}`, which closes an inner `{start = 0}` rather than the table.
function balancedTable(source, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}' && --depth === 0) return source.slice(openIndex, i + 1);
  }
  return null;
}

function namedTable(source, local) {
  const declaration = source.indexOf(`local ${local}`);
  return declaration < 0 ? null : balancedTable(source, source.indexOf('{', declaration));
}

function mythicPhases(source) {
  const registration = REGISTRATION.exec(source);
  const local = registration && MYTHIC_TABLE.exec(registration[2])?.[1];
  const table = local ? namedTable(source, local) : null;
  const phasesAt = table?.indexOf('phases') ?? -1;
  const phases = phasesAt < 0 ? null : balancedTable(table, table.indexOf('{', phasesAt));
  if (!registration || !phases) return null;
  return {
    encounterId: Number(registration[1]),
    phases: [...phases.matchAll(PHASE_ENTRY)]
      .map(([, phase, start_s]) => ({ phase: Number(phase), start_s: Number(start_s) }))
      .sort((a, b) => a.start_s - b.start_s),
  };
}

// Giving phases to a boss whose module never advances one would strand its later lines in a phase the addon never enters.
function rearmingEncounterIds(alerts) {
  const ids = new Set();
  for (const source of alerts) {
    const id = source && ENCOUNTER_ID.exec(source)?.[1];
    if (id && source.includes('StartReminders')) ids.add(Number(id));
  }
  return ids;
}

function manifestPaths(source, pattern, prefix) {
  return [...source.matchAll(pattern)].map(match => `${prefix}${match[1]}`);
}

const [toc, timelineManifest] = await Promise.all([fetchText(TOC), fetchText(TIMELINE_MANIFEST)]);
const alertPaths = manifestPaths(toc, ALERT_ENTRY, '');
const timelinePaths = manifestPaths(timelineManifest, TIMELINE_ENTRY, 'BossTimelines/');
if (!alertPaths.length || !timelinePaths.length) {
  throw new Error(`the addon manifests list ${timelinePaths.length} boss timeline and ${alertPaths.length} encounter alert file(s); their layout moved`);
}

const [alerts, timelines] = await Promise.all([
  Promise.all(alertPaths.map(fetchOptionalText)),
  Promise.all(timelinePaths.map(fetchOptionalText)),
]);
const rearming = rearmingEncounterIds(alerts);
const parsed = timelines.filter(Boolean).map(mythicPhases).filter(Boolean);

const phases = {};
for (const timeline of parsed.sort((a, b) => a.encounterId - b.encounterId)) {
  if (rearming.has(timeline.encounterId) && timeline.phases.length) phases[timeline.encounterId] = timeline.phases;
}
for (const encounterId of [...rearming].sort((a, b) => a - b)) {
  if (!phases[encounterId]) console.error(`::warning::encounter ${encounterId} re-arms reminders but has no Mythic phase table; its export stays pull-relative`);
}
if (!Object.keys(phases).length) {
  throw new Error(`parsed ${parsed.length} timeline(s) and ${rearming.size} re-arming encounter(s) but produced no phases; the addon source shape moved`);
}

await mkdir(dirname(TARGET), { recursive: true });
await writeFile(TARGET, `${JSON.stringify(phases)}\n`);
console.log(`Wrote ${TARGET}: ${Object.keys(phases).length} phased encounter(s) of ${parsed.length} timeline(s).`);
