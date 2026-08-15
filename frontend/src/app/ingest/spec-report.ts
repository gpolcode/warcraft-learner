// The run log is the only view of fleet freshness, so it reports every known spec - including the ones this run's cap defers.

export interface SpecReportRow {
  spec: string;
  version: number | null;
  ingestedAtMs: number | null;
  selected: boolean;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNKNOWN = '?';
export const SELECTED_MARKER = '*';

/** Null for anything unparseable, so a hand-edited or absent stamp reports as unknown instead of `NaN`. */
export function parseIngestedAt(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** A stamp ahead of the clock reads as `0s`, never as a negative age. */
export function formatAge(ageMs: number): string {
  const age = Math.max(0, ageMs);
  if (age >= DAY) return `${Math.floor(age / DAY)}d`;
  if (age >= HOUR) return `${Math.floor(age / HOUR)}h`;
  if (age >= MINUTE) return `${Math.floor(age / MINUTE)}m`;
  return `${Math.floor(age / SECOND)}s`;
}

export function formatSpecReport(rows: readonly SpecReportRow[], nowMs: number): string {
  const cells = rows.map(row => ({
    marker: row.selected ? SELECTED_MARKER : ' ',
    spec: row.spec,
    version: `v${row.version ?? UNKNOWN}`,
    age: row.ingestedAtMs != null ? formatAge(nowMs - row.ingestedAtMs) : UNKNOWN,
  }));
  const specWidth = Math.max(0, ...cells.map(cell => cell.spec.length));
  const versionWidth = Math.max(0, ...cells.map(cell => cell.version.length));
  return cells
    .map(cell => `${cell.marker} ${cell.spec.padEnd(specWidth)}  ${cell.version.padEnd(versionWidth)}  ${cell.age}`)
    .join('\n');
}
