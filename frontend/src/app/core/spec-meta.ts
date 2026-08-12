// The browser hydrates this at startup without blocking bootstrap; the headless ingest runtime hydrates it explicitly.
import { signal } from '@angular/core';
import type { SpecMeta } from './models/spec-meta.models';

export type { SpecMeta };

const ZAM = 'https://wow.zamimg.com/images/wow/icons/small';

/** Class-icon stem for a class name (space-tolerant): 'Death Knight' -> 'class_deathknight'. */
function classIconStem(className: string): string {
  return `class_${className.toLowerCase().replace(/ /g, '')}`;
}

/** The hydrated spec universe (folder key -> meta) and the set of real class-icon stems. */
const UNIVERSE = signal<{ metas: Record<string, SpecMeta>; classIcons: Set<string> }>(
  { metas: {}, classIcons: new Set() });

let markHydrated: () => void;
const hydrated = new Promise<void>(resolve => { markHydrated = resolve; });

// Idempotent - a later call replaces the cache.
export function hydrateSpecMeta(metas: SpecMeta[] | Record<string, SpecMeta>): void {
  const list = Array.isArray(metas) ? metas : Object.values(metas);
  UNIVERSE.set({
    metas: Object.fromEntries(list.map(meta => [meta.spec, meta])),
    classIcons: new Set(list.map(meta => meta.classIcon)),
  });
  markHydrated();
}

/** specMetaOf, deferred until hydration lands - for callers outside a reactive context. */
export async function resolveSpecMeta(spec: string | null | undefined): Promise<SpecMeta | undefined> {
  await hydrated;
  return specMetaOf(spec);
}

/** One entry per class, in stable display order, for the Class dropdown. */
export function classList(): { className: string; classLabel: string; classIcon: string }[] {
  const byClass = new Map<string, { className: string; classLabel: string; classIcon: string }>();
  for (const meta of Object.values(UNIVERSE().metas)) {
    if (!byClass.has(meta.className)) {
      byClass.set(meta.className, { className: meta.className, classLabel: meta.classLabel, classIcon: meta.classIcon });
    }
  }
  return [...byClass.values()].sort((first, second) => first.classLabel.localeCompare(second.classLabel));
}

/** Spec metas for `className`, restricted to the `available` folder keys (those with data), sorted by spec label. */
export function specsForClass(className: string, available: string[]): SpecMeta[] {
  return available
    .map(spec => UNIVERSE().metas[spec])
    .filter((meta): meta is SpecMeta => !!meta && meta.className === className)
    .sort((first, second) => first.specLabel.localeCompare(second.specLabel));
}

export function specMetaOf(spec: string | null | undefined): SpecMeta | undefined {
  return spec ? UNIVERSE().metas[spec] : undefined;
}

// Returns '' for an unknown class, so a name-only fallback never shows a broken image.
export function classIconUrl(className: string): string {
  const stem = classIconStem(className);
  return UNIVERSE().classIcons.has(stem) ? `${ZAM}/${stem}.jpg` : '';
}

/** zamimg spec-icon URL for a spec folder key, or '' when the spec is unknown or has no baked stem. */
export function specIconUrl(spec: string): string {
  const meta = UNIVERSE().metas[spec];
  return meta && meta.specIcon ? `${ZAM}/${meta.specIcon}.jpg` : '';
}
