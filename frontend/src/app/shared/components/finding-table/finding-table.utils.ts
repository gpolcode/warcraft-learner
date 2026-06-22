import { AnalysisFinding } from '../../../core/models/analysis.models';

/** The prominent "Measured" cell: a value over its unit (e.g. "1 / 15" + "cast(s)"). */
export interface FindingMeasure {
  value: string;
  unit?: string;
}

/**
 * One row of the flat finding table (severity · What · Measured · Fix).
 * Rule rows carry a plain `what` label; cooldown rows carry a spell identity.
 */
export interface FindingRow {
  severity: 'critical' | 'warning';
  name?: string;
  spellId?: number | null;
  timestampMs?: number | null;
  chip?: string;
  what?: string;
  measured: FindingMeasure;
  fix?: string;
}

/** A cooldown used on plan, shown as a compact success chip rather than a row. */
export interface OnPlanChip {
  name: string;
  spellId: number | null;
}

/** One collapsed spell entry: a cooldown / defensive and the findings it gathered. */
export interface FindingEntry {
  name: string;
  spellId: number | null;
  hasIssue: boolean;
  hasCritical: boolean;
  metaItems: string[];
  findings: AnalysisFinding[];
}

/**
 * Split a backend-templated finding message ("Label: measurement.") into its
 * label and a measured value. Fallback used when a finding has no structured
 * `measured` field; the analysis engine normally populates `measured` directly.
 */
export function splitMessage(message: string): { label: string; measured: FindingMeasure } {
  const idx = message.indexOf(':');
  if (idx === -1) {
    const text = message.trim().replace(/\.$/, '');
    return { label: text, measured: { value: text } };
  }
  const label = message.slice(0, idx).trim();
  const value = message.slice(idx + 1).trim().replace(/\.$/, '');
  return { label, measured: { value } };
}

/** Flatten cooldown entries with issues into one table row per finding. */
export function rowsFromEntries(entries: FindingEntry[], catLabel: Record<string, string>): FindingRow[] {
  const rows: FindingRow[] = [];
  for (const entry of entries) {
    if (!entry.hasIssue) continue;
    for (const f of entry.findings) {
      const split = splitMessage(f.message);
      rows.push({
        severity: f.severity === 'critical' ? 'critical' : 'warning',
        name: entry.name,
        spellId: entry.spellId,
        timestampMs: f.timestamp_ms ?? null,
        chip: catLabel[f.category],
        measured: f.measured ?? split.measured,
        fix: f.details?.remedy,
      });
    }
  }
  return rows;
}

/** Cooldowns without any issue become "on plan" chips. */
export function onPlanFromEntries(entries: FindingEntry[]): OnPlanChip[] {
  return entries.filter(e => !e.hasIssue).map(e => ({ name: e.name, spellId: e.spellId }));
}
