/**
 * Pure gear-comparison helpers shared between the pre-fight boss-study page and
 * the analyze page's gear section. All functions are framework-free and unit-testable
 * without Angular.
 */
import { CharacterGear } from '../../core/models/wcl.models';
import { EncounterGearStats } from '../../core/models/encounter.models';

export type GearStatus = 'ok' | 'warn' | 'info' | 'unknown';

const SLOT_NAMES: Record<number, string> = {
  0:'Head', 1:'Neck', 2:'Shoulder', 3:'Back', 4:'Chest', 5:'Waist', 6:'Legs',
  7:'Feet', 8:'Wrists', 9:'Hands', 10:'Ring 1', 11:'Ring 2',
  12:'Trinket 1', 13:'Trinket 2', 14:'Back', 15:'Main Hand', 16:'Off Hand',
};

const STATUS_ICONS: Record<GearStatus, string> = {
  ok: 'check_circle', warn: 'warning', info: 'info', unknown: 'help_outline',
};

const STATUS_CLASSES: Record<GearStatus, string> = {
  ok: 'badge-success', warn: 'badge-warning', info: 'badge-info', unknown: 'text-[var(--muted)]',
};

export function slotName(slot: number): string { return SLOT_NAMES[slot] || `Slot ${slot}`; }
export function statusIcon(status: GearStatus): string { return STATUS_ICONS[status]; }
export function statusClass(status: GearStatus): string { return STATUS_CLASSES[status]; }

// ── Shared types ────────────────────────────────────────────────────────────

export interface EnchantRow {
  slotName: string;
  status: GearStatus;
  name: string;
  note: string | null;
}

export interface TalentBuildRow {
  pct: number;
  isPlayer: boolean;
  link: string | null;
  playerName: string;
  label: string;
}

export interface TrinketRow {
  slotLabel: string;
  status: GearStatus;
  /** Item id of what to display (the player's trinket, or the top trinket when missing). */
  id: number;
  name: string;
  icon: string;
  /** Top-parse usage % of the displayed item, when known. */
  pct: number | null;
  /** Prescriptive fix shown in the remedy column; null when on plan. */
  remedy: string | null;
}

// ── Player-vs-bench comparison (analyze page) ───────────────────────────────

/**
 * Enchants: flag slots the player left un-enchanted that top parsers consider
 * mandatory, and surface where the player differs from the consensus enchant.
 */
export function buildEnchantRows(gear: CharacterGear | null, stats: EncounterGearStats | null): EnchantRow[] {
  const topEnch = stats?.enchants ?? {};
  const playerEnch = gear?.enchants ?? [];
  if (!Object.keys(topEnch).length && !playerEnch.length) return [];
  const slots = new Set<number>();
  for (const k of Object.keys(topEnch)) slots.add(Number(k));
  for (const e of playerEnch) slots.add(e.slot);

  const rows: EnchantRow[] = [];
  for (const slot of [...slots].sort((a, b) => a - b)) {
    const name = slotName(slot);
    const top = topEnch[slot]?.[0];
    const topName = top ? (top.name || `Enchant #${top.id}`) : '';
    const player = playerEnch.find(e => e.slot === slot);
    if (!player) {
      if (top && top.pct >= 70) {
        rows.push({ slotName: name, status: 'warn', name: 'Not enchanted', note: `Apply ${topName}` });
      } else if (top && top.pct >= 40) {
        rows.push({ slotName: name, status: 'info', name: 'Not enchanted', note: `Apply ${topName}` });
      }
      continue;
    }
    const playerName = player.name || `Enchant #${player.id}`;
    if (top && player.id === top.id) {
      rows.push({ slotName: name, status: 'ok', name: playerName, note: `Matches top parsers (${top.pct}%)` });
    } else if (top) {
      rows.push({ slotName: name, status: 'info', name: playerName, note: `Switch to ${topName}` });
    } else {
      rows.push({ slotName: name, status: 'ok', name: playerName, note: null });
    }
  }
  return rows;
}

export function enchantStatusOf(rows: EnchantRow[]): GearStatus {
  return rows.some(r => r.status === 'warn') ? 'warn' : 'ok';
}

/** Top-parse talent builds with a link to an example parse running each one. */
export function buildTalentBuilds(stats: EncounterGearStats | null, playerKey: string): TalentBuildRow[] {
  const builds = stats?.talent_builds ?? [];
  if (!builds.length) return [];
  return builds.map((b, i) => ({
    pct: b.pct,
    isPlayer: !!playerKey && b.key === playerKey,
    link: b.report_code ? `https://www.warcraftlogs.com/reports/${b.report_code}#fight=${b.fight_id ?? 0}` : null,
    playerName: b.player_name || '',
    label: i === 0 ? 'Most common build' : `Alt build ${i}`,
  }));
}

export function talentStatusOf(topStats: EncounterGearStats | null, playerKey: string): { status: GearStatus; note: string } {
  const builds = topStats?.talent_builds ?? [];
  if (!builds.length) return { status: 'unknown', note: 'No talent data yet.' };
  const topPct = builds[0]?.pct ?? 0;
  // No comparable player build (not ranked here, or format mismatch): just
  // present the consensus build positively rather than flagging it.
  if (!playerKey || playerKey.split(':')[0] !== (builds[0]?.key ?? '').split(':')[0]) {
    return { status: 'ok', note: `Most common build used by ${topPct}% of top parsers` };
  }
  if (builds.some(b => b.key === playerKey)) {
    return { status: 'ok', note: 'On a top-parse build' };
  }
  return { status: 'warn', note: `Your build differs - most common used by ${topPct}% of top parsers` };
}

/**
 * Trinkets: per slot (12, 13) compare the player's equipped trinket to the
 * top-parse consensus. Matching the top trinket is `ok`; differing or missing
 * one while a consensus exists is `info` with a prescriptive switch remedy.
 */
export function buildTrinketRows(gear: CharacterGear | null, stats: EncounterGearStats | null): TrinketRow[] {
  const topTrinkets = stats?.trinkets ?? {};
  const playerTrinkets = gear?.trinkets ?? [];
  return [12, 13].reduce<TrinketRow[]>((acc, slot) => {
    const slotLabel = slotName(slot);
    const top = topTrinkets[slot]?.[0];
    const player = playerTrinkets.find(t => t.slot === slot);
    if (player) {
      const match = (topTrinkets[slot] ?? []).find(t => t.id === player.id);
      if (match) {
        acc.push({ slotLabel, status: 'ok', id: player.id, name: player.name,
          icon: player.icon || '', pct: match.pct, remedy: null });
      } else if (top) {
        acc.push({ slotLabel, status: 'info', id: player.id, name: player.name,
          icon: player.icon || '', pct: null, remedy: `Switch to ${top.name}` });
      } else {
        acc.push({ slotLabel, status: 'ok', id: player.id, name: player.name,
          icon: player.icon || '', pct: null, remedy: null });
      }
    } else if (top) {
      acc.push({ slotLabel, status: 'info', id: top.id, name: top.name, icon: '',
        pct: top.pct, remedy: `Equip ${top.name}` });
    }
    return acc;
  }, []);
}

// ── Bench-only display (/pre boss-study page) ───────────────────────────────

export interface BenchEnchantRow {
  slotName: string;
  name: string;
  pct: number;
}

export interface BenchTrinketRow {
  slotLabel: string;
  id: number;
  name: string;
  pct: number;
}

/**
 * Shows the consensus enchant per slot for the boss-study view.
 * Omits slots where fewer than 40% of top parsers enchant.
 */
export function buildBenchEnchantRows(stats: EncounterGearStats | null): BenchEnchantRow[] {
  const topEnch = stats?.enchants ?? {};
  return Object.keys(topEnch)
    .map(Number)
    .sort((a, b) => a - b)
    .reduce<BenchEnchantRow[]>((acc, slot) => {
      const top = topEnch[slot]?.[0];
      if (top && top.pct >= 40) {
        acc.push({ slotName: slotName(slot), name: top.name || `Enchant #${top.id}`, pct: top.pct });
      }
      return acc;
    }, []);
}

/**
 * Shows the most-used trinket per slot (12 and 13) for the boss-study view.
 */
export function buildBenchTrinketRows(stats: EncounterGearStats | null): BenchTrinketRow[] {
  const topTrinkets = stats?.trinkets ?? {};
  return [12, 13].reduce<BenchTrinketRow[]>((acc, slot) => {
    const top = topTrinkets[slot]?.[0];
    if (top) acc.push({ slotLabel: slotName(slot), id: top.id, name: top.name, pct: top.pct });
    return acc;
  }, []);
}

// ── Unified gear card (Talents / Trinkets / Enchants sections) ──────────────
//
// Each section renders like a `wl-finding-table`: a title + sub-heading, compact
// rows for items needing attention (with the fix in the remedy column), and a
// single "On plan" success chip when the section is clean. In bench-only mode
// (the /pre study page, no player gear) the rows instead list the top-parse
// consensus with usage %.

/** One row in a gear section: an item needing a fix, or a consensus pick (bench mode). */
export interface GearRow {
  status: GearStatus;
  /** Slot label shown before the name, e.g. "Trinket 1", "Head". Empty for talents. */
  slotLabel: string;
  /** Item id for `wl-game-icon` (trinkets); null for text-only rows (enchants/talents). */
  itemId: number | null;
  itemIcon: string;
  name: string;
  /** Prescriptive fix text (analyze mode); null when the fix is a link or n/a. */
  fix: string | null;
  /** Link to an example top parse (talent fix, or bench-mode "View parse"). */
  link: string | null;
  /** Top-parse usage %, shown only in bench mode. */
  pct: number | null;
}

/** A Talents / Trinkets / Enchants section of the unified gear card. */
export interface GearCategory {
  key: 'talents' | 'trinkets' | 'enchants';
  title: string;
  subtitle: string;
  benchMode: boolean;
  rows: GearRow[];
  /** Simple text for the single "On plan" success chip; null when issues exist. */
  onPlan: string | null;
  /** Shown when there is no data at all for the section. */
  emptyHint: string | null;
}

/**
 * Talents: a success chip when the player is on a top-parse build, otherwise a
 * single row whose fix is a link to the consensus build (no build specifics are
 * surfaced). Bench mode lists the most-used builds with a "View parse" link.
 */
export function buildTalentCategory(gear: CharacterGear | null, stats: EncounterGearStats | null): GearCategory {
  const builds = buildTalentBuilds(stats, gear?.talent_key ?? '');
  if (!gear) {
    const rows: GearRow[] = builds.map(build => ({
      status: 'unknown', slotLabel: '', itemId: null, itemIcon: '', name: build.label,
      fix: null, link: build.link, pct: build.pct,
    }));
    return { key: 'talents', title: 'Talents', subtitle: 'Most-used builds among top parsers.',
      benchMode: true, rows, onPlan: null, emptyHint: rows.length ? null : 'No talent data yet.' };
  }
  const status = talentStatusOf(stats, gear.talent_key ?? '');
  const base = { key: 'talents' as const, title: 'Talents',
    subtitle: 'Your build vs the top-parse consensus.', benchMode: false };
  if (status.status === 'unknown') {
    return { ...base, rows: [], onPlan: null, emptyHint: 'No talent data yet.' };
  }
  if (status.status === 'warn') {
    return { ...base, emptyHint: null, onPlan: null, rows: [{
      status: 'warn', slotLabel: '', itemId: null, itemIcon: '',
      name: 'Build differs from top parses', fix: null, link: builds[0]?.link ?? null, pct: null,
    }] };
  }
  return { ...base, rows: [], onPlan: 'Optimal build', emptyHint: null };
}

/**
 * Trinkets: a success chip when both slots match a top pick, otherwise a row per
 * slot (the matching one compact, the off-meta one carrying a switch/equip fix).
 */
export function buildTrinketCategory(gear: CharacterGear | null, stats: EncounterGearStats | null): GearCategory {
  if (!gear) {
    const rows: GearRow[] = buildBenchTrinketRows(stats).map(row => ({
      status: 'unknown', slotLabel: row.slotLabel, itemId: row.id, itemIcon: '', name: row.name,
      fix: null, link: null, pct: row.pct,
    }));
    return { key: 'trinkets', title: 'Trinkets', subtitle: 'Most-used trinkets among top parsers.',
      benchMode: true, rows, onPlan: null, emptyHint: rows.length ? null : 'No trinket data yet.' };
  }
  const trinketRows = buildTrinketRows(gear, stats);
  const base = { key: 'trinkets' as const, title: 'Trinkets',
    subtitle: 'Your trinkets vs the top-parse picks.', benchMode: false };
  if (!trinketRows.length) return { ...base, rows: [], onPlan: null, emptyHint: 'No trinket data yet.' };
  if (trinketRows.every(row => row.status === 'ok')) {
    return { ...base, rows: [], onPlan: 'Both optimal', emptyHint: null };
  }
  const rows: GearRow[] = trinketRows.map(row => ({
    status: row.status, slotLabel: row.slotLabel, itemId: row.id, itemIcon: row.icon,
    name: row.name, fix: row.remedy, link: null, pct: null,
  }));
  return { ...base, rows, onPlan: null, emptyHint: null };
}

/**
 * Enchants: a success chip when every slot is on plan, otherwise a row per
 * missing/off-meta slot (naming the correct enchant in the fix) plus an
 * "N optimal" chip summarising the slots that are already correct.
 */
export function buildEnchantCategory(gear: CharacterGear | null, stats: EncounterGearStats | null): GearCategory {
  if (!gear) {
    const rows: GearRow[] = buildBenchEnchantRows(stats).map(row => ({
      status: 'unknown', slotLabel: row.slotName, itemId: null, itemIcon: '', name: row.name,
      fix: null, link: null, pct: row.pct,
    }));
    return { key: 'enchants', title: 'Enchants', subtitle: 'Most-used enchants among top parsers.',
      benchMode: true, rows, onPlan: null, emptyHint: rows.length ? null : 'No enchant data yet.' };
  }
  const enchantRows = buildEnchantRows(gear, stats);
  const base = { key: 'enchants' as const, title: 'Enchants',
    subtitle: 'Your enchants vs the top-parse picks.', benchMode: false };
  if (!enchantRows.length) return { ...base, rows: [], onPlan: null, emptyHint: 'No enchant data yet.' };
  const issues = enchantRows.filter(row => row.status !== 'ok');
  const okCount = enchantRows.length - issues.length;
  if (!issues.length) return { ...base, rows: [], onPlan: 'All optimal', emptyHint: null };
  const rows: GearRow[] = issues.map(row => ({
    status: row.status, slotLabel: row.slotName, itemId: null, itemIcon: '', name: row.name,
    fix: row.note, link: null, pct: null,
  }));
  return { ...base, rows, onPlan: okCount ? `${okCount} optimal` : null, emptyHint: null };
}
