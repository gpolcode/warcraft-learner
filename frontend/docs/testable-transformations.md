# Testable transformations

How to write the calculations inside the per-use-case `*TransformService` (ingest)
and `*FeatureService` (runtime) slices so that each one stays simple and **every
calculated field is its own small, pure, individually testable function**.

This is the companion to the layer rules in the root `CLAUDE.md`. All examples
use this repo's real identifiers, file paths, and test builders.

---

## 1. The principle: functional core, imperative shell

Split every slice into two parts:

- **Imperative shell** - the Angular `@Injectable` service (`*FeatureService`,
  `*TransformService`). It does the I/O (fetch raw WCL events via `WclApiService`,
  read prepared data via a `*DataSource`), then calls the pure core, then returns.
  It contains **no arithmetic**.
- **Functional core** - the `*.vm.ts` file: plain functions over plain data. No
  Angular, no `HttpClient`, no `inject()`. This is where every field is computed,
  and it is the only thing you unit-test.

```
                fetch raw            call pure core           return
  *Service  ->  WclApiService  ->   burst.vm functions     ->  view-model
  (shell)       *DataSource         (burst.vm.ts core)         (signals)
```

This is the convention the repo already uses: `pages/pre-fight/pre-fight.vm.ts`
and `pages/post-raid/post-raid.vm.ts` are pure-function modules tested by
`*.vm.spec.ts`, and the components just call them. New slices extend that pattern;
they do not invent a parallel one.

Why this works here specifically:

- The core stays **isomorphic**: the exact same `*.vm.ts` functions run in ingest
  (Node) and in the browser under the no-ingestion dev flag (the `*TransformService`
  swap). That is only possible because the core never touches the framework.
- The shell has nothing worth unit-testing (it just wires), so you never need
  `TestBed` for the math.

> Today's `core/analysis/*` and `scripts/ingest/analysis/*` modules are already
> framework-free (they import only models + `stats`). They are a functional core
> already - this guide is about keeping each *field* inside that core isolated and
> tested.

---

## 2. One pure function per calculated field

The rule of thumb:

> If a value is assigned to a named output field, there should be a named
> function that computes exactly that value (or one cohesive group of values),
> and a test named after it.

Name the function after **what it returns**, not after the loop it came from, and
put it in the slice's `*.vm.ts` (or `shared/` if more than one slice needs it).

### The model to copy (already in the repo)

`scripts/ingest/analysis/stats.ts` - tiny, total, reused primitives:

```ts
export function mean(values: number[]): number {
  return values.length ? ss.mean(values) : 0;
}
export function stdev(values: number[]): number {
  return values.length >= 2 ? ss.sampleStandardDeviation(values) : 0;
}
export function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
```

`core/analysis/bench-stats.ts` - one decision per function:

```ts
/** True when `value` sits more than `sigmas` standard deviations ABOVE the mean. */
export function isOutlierAbove(value: number, mean: number, stddev: number, sigmas = 2): boolean {
  return value > mean + sigmas * stddev;
}

/** Data-driven expected cooldown uses for a fight of this length. */
export function benchExpectedUses(fightDurS: number, upm: UsesPerMin): { expected: number; floor: number } {
  const fightMin = fightDurS / 60;
  const expected = Math.round(upm.avg * fightMin);
  const floor = Math.max(0, Math.round(expected - upm.stddev * fightMin));
  return { expected, floor };
}
```

Each is trivially testable because it has no dependencies and one responsibility.
That is the target shape for *all* field calculations.

---

## 3. The antipattern: one loop computing many fields

`scripts/ingest/analysis/cooldowns.ts` -> `summarizeCooldownCasts` computes five
output fields (`first_cast_s`, `bl_aligned`, `bl_offset_s`, `hold_windows`,
`cast_pattern`) inline in one loop:

```ts
// BEFORE (abridged): every field is entangled in one loop body.
for (const cooldown of specCds) {
  const cdCasts = castEvents
    .filter(cast => cast.type === 'cast' && cast.abilityGameID === cooldown.spell_id)
    .sort((a, b) => a.timestamp - b.timestamp);
  const castTimesS = cdCasts.map(c => (c.timestamp - fightStartMs) / 1000);
  const firstCastS = castTimesS.length ? castTimesS[0] : null;

  let blAligned = false;
  let blOffsetS: number | null = null;
  if (blTimeS != null && castTimesS.length) {
    for (const timeS of castTimesS) {
      if (blTimeS - BL_WINDOW_BEFORE_S <= timeS && timeS <= blTimeS + BL_WINDOW_AFTER_S) { blAligned = true; break; }
    }
    // ... compute offset to nearest cast in BL window ...
  }

  const holdWindows: HoldWindow[] = [];
  if (castTimesS.length > 1) {
    let expectedT = castTimesS[0];
    for (let i = 1; i < castTimesS.length; i++) {
      expectedT += cooldown.cooldown ?? 90;
      const holdAmount = castTimesS[i] - expectedT;
      if (holdAmount > HOLD_THRESHOLD_S) holdWindows.push({ /* ... */ });
    }
  }

  cdSummary.push({
    name: cooldown.name, spell_id: cooldown.spell_id, total_uses: cdCasts.length,
    first_cast_s: firstCastS, bl_aligned: blAligned, bl_offset_s: blOffsetS,
    cast_times_s: castTimesS, hold_windows: holdWindows,
    cast_pattern: holdWindows.length ? 'hold' : 'on_cooldown',
  });
}
```

Problems for testing:

- To test "does BL alignment work at the window edge?" you must build a full
  event stream, run the whole function, and dig `bl_aligned` out of the result.
- The hold-window math and the BL math share local variables and a loop, so you
  cannot exercise one without the other.
- A boundary bug in one field is hard to pin to a single function.

---

## 4. Worked refactor A: decompose `summarizeCooldownCasts`

Pull each field into a named pure function in a `*.vm.ts`.

```ts
// cooldown.vm.ts - functional core, one field per function.

/** Cast timestamps (s, fight-relative), ascending. */
export function castTimesS(cdCasts: WclResourceEvent[], fightStartMs: number): number[] {
  return cdCasts
    .filter(c => c.type === 'cast')
    .map(c => (c.timestamp - fightStartMs) / 1000)
    .sort((a, b) => a - b);
}

/** First cast time, or null if the CD was never used. */
export function firstCastS(times: number[]): number | null {
  return times.length ? round(times[0]) : null;
}

/** Whether any cast landed in the Bloodlust window, plus the nearest offset. */
export function bloodlustAlignment(
  times: number[],
  blTimeS: number | null,
): { aligned: boolean; offsetS: number | null } {
  if (blTimeS == null || !times.length) return { aligned: false, offsetS: null };
  const inWindow = times.filter(t => blTimeS - BL_WINDOW_BEFORE_S <= t && t <= blTimeS + BL_WINDOW_AFTER_S);
  if (!inWindow.length) return { aligned: false, offsetS: null };
  const nearest = inWindow.reduce((a, b) => (Math.abs(b - blTimeS) < Math.abs(a - blTimeS) ? b : a));
  return { aligned: true, offsetS: round(nearest - blTimeS) };
}

/** Casts that came >HOLD_THRESHOLD_S later than on-cooldown timing. */
export function holdWindows(times: number[], cooldownS: number): HoldWindow[] {
  const out: HoldWindow[] = [];
  let expected = times[0];
  for (let i = 1; i < times.length; i++) {
    expected += cooldownS;
    const holdAmount = times[i] - expected;
    if (holdAmount > HOLD_THRESHOLD_S) {
      out.push({ cast_index: i + 1, expected_s: round(expected), actual_s: round(times[i]), hold_amount_s: round(holdAmount) });
    }
  }
  return out;
}

/** A CD is a "hold" pattern when it has at least one hold window. */
export function castPattern(holds: HoldWindow[]): 'hold' | 'on_cooldown' {
  return holds.length ? 'hold' : 'on_cooldown';
}
```

The summary function becomes a thin **assembler** - no arithmetic of its own,
just composition:

```ts
// AFTER: the assembler only composes named field functions.
export function summarizeCooldownCasts(
  castEvents: WclResourceEvent[], specCds: RulebookCooldown[],
  fightStartMs: number, blTimeS: number | null,
): CdCastSummary[] {
  return specCds.map(cd => {
    const casts = castEvents.filter(c => c.abilityGameID === cd.spell_id);
    const times = castTimesS(casts, fightStartMs);
    const bl = bloodlustAlignment(times, blTimeS);
    const holds = holdWindows(times, cd.cooldown ?? 90);
    return {
      name: cd.name, spell_id: cd.spell_id, total_uses: times.length,
      first_cast_s: firstCastS(times),
      bl_aligned: bl.aligned, bl_offset_s: bl.offsetS,
      cast_times_s: times.map(t => round(t, 2)),
      hold_windows: holds, cast_pattern: castPattern(holds),
    };
  });
}
```

### Tests: one focused spec per field

Use the existing builders (`scripts/ingest/testing/`): `Events`, `parseClock`,
and the named `spell-ids` constants. Each field is a one-line call with
table-driven cases.

```ts
import { describe, it, expect } from 'vitest';
import { bloodlustAlignment, holdWindows, firstCastS } from './cooldown.vm.ts';

describe('bloodlustAlignment', () => {
  // BL at 60s; window is [60 - BEFORE, 60 + AFTER].
  it.each([
    { name: 'cast inside the window aligns', times: [62], aligned: true },
    { name: 'cast far before does not align', times: [5], aligned: false },
    { name: 'no casts -> not aligned', times: [], aligned: false },
  ])('$name', ({ times, aligned }) => {
    expect(bloodlustAlignment(times, 60).aligned).toBe(aligned);
  });

  it('reports the signed offset to the nearest in-window cast', () => {
    expect(bloodlustAlignment([64], 60).offsetS).toBe(4);
    expect(bloodlustAlignment([57], 60).offsetS).toBe(-3);
  });
});

describe('holdWindows', () => {
  it('flags a recast held >8s past on-cooldown time', () => {
    // cooldown 90s, first at 0:00, second at 1:45 (105s) -> held 15s.
    const holds = holdWindows([0, 105], 90);
    expect(holds).toHaveLength(1);
    expect(holds[0]).toMatchObject({ cast_index: 2, hold_amount_s: 15 });
  });

  it('does not flag an on-cooldown recast', () => {
    expect(holdWindows([0, 92], 90)).toHaveLength(0); // within the 8s slack
  });
});

describe('firstCastS', () => {
  it.each([
    { times: [], expected: null },
    { times: [12.34, 40], expected: 12.3 },
  ])('first of $times -> $expected', ({ times, expected }) => {
    expect(firstCastS(times)).toBe(expected);
  });
});
```

You can still keep one higher-level test on `summarizeCooldownCasts` itself (with
the `Events` builder) as a smoke test that the assembly wires the fields together,
but the *edge cases* now live on the small functions where they are cheap to
enumerate.

---

## 5. Worked refactor B: findings as `create*Finding(...) => Finding | null`

The frontend `core/analysis/cooldown-analysis.ts` builds several
`AnalysisFinding`s inside one big `for (const cd of specCds)` loop. Each finding
is a "one field -> one function" candidate, where the "field" is a finding that
may or may not apply (so the return type is `AnalysisFinding | null`).

```ts
// finding-factories.ts - each returns a finding or null. Pure.
export function createLostCooldownFinding(
  cdName: string, actual: number, expected: number, floor: number, fightDurS: number,
): AnalysisFinding | null {
  if (expected < 1 || actual >= floor) return null;
  const lost = floor - actual;
  return {
    severity: 'critical', category: 'lost_cooldown', cd_name: cdName,
    measured: { value: `${actual} / ${expected}`, unit: 'cast(s)' },
    message: actual === 0
      ? `${cdName} was never used. Top parsers average ~${expected} cast(s) on a ${fmtClock(fightDurS)} fight.`
      : `${cdName} - ${actual} casts; top parsers average ~${expected}. Lost ${lost} use(s).`,
    details: { remedy: `Fit ${Math.max(1, lost)} more use(s) of ${cdName} by pressing it sooner after each reset.` },
  };
}

export function createBloodlustAlignmentFinding(
  cdName: string, aligned: boolean, firstCastMs: number, blTimeS: number,
): AnalysisFinding | null {
  if (aligned) return null;
  return {
    severity: 'critical', category: 'cooldown_alignment', cd_name: cdName,
    timestamp_ms: firstCastMs, measured: { value: 'missed', unit: 'BL' },
    message: `${cdName} missed Bloodlust (BL at ${fmtClock(blTimeS)}).`,
    details: { remedy: `Align ${cdName} with Bloodlust.` },
  };
}
```

The analyzer becomes a list you compose, then sort - the existing
`sortBySeverity` from `core/analysis/findings.ts` still does the ordering:

```ts
const findings = [
  createLostCooldownFinding(cd.name, actual, expected, floor, fightDurS),
  createBloodlustAlignmentFinding(cd.name, bl.aligned, firstMs, blTimeS),
  // ...one entry per finding type...
].filter((f): f is AnalysisFinding => f !== null);
sortBySeverity(findings);
```

Tests call the factory directly - no event stream needed at all, which is the
big readability win over "build 10 events, assert the message contains a string":

```ts
import { createLostCooldownFinding } from './finding-factories.ts';

describe('createLostCooldownFinding', () => {
  it('returns null when usage meets the floor', () => {
    expect(createLostCooldownFinding('Feint', 3, 3, 3, 300)).toBeNull();
  });

  it('flags a never-used cooldown as critical with a remedy', () => {
    const f = createLostCooldownFinding('Feint', 0, 3, 3, 300);
    expect(f).toMatchObject({ severity: 'critical', category: 'lost_cooldown' });
    expect(f?.measured).toEqual({ value: '0 / 3', unit: 'cast(s)' });
    expect(f?.details?.remedy).toContain('more use(s) of Feint');
  });
});
```

This mirrors the pattern `core/analysis/rule-engine.ts` already uses with
`evaluateCastWithoutPrior` / `evaluateHoldForAnchor` (each returns
`AnalysisFinding | null`) - extend the same shape to the cooldown/defensive
findings.

---

## 6. Testing approach (mirror what the repo already does)

- **Runner:** vitest. Ingest specs run under `vitest.scripts.config.ts`
  (`scripts/**/*.spec.ts`, node env); frontend specs run under `ng test`. Co-locate
  `*.vm.spec.ts` next to the `*.vm.ts`.
- **Builders, not literals:** construct inputs with `Events` (`events.ts`),
  `sample()` (`samples.ts`), and `parseClock` (`clock.ts`); reference spells via
  the named constants in `spell-ids.ts` so specs read as sentences.
- **Table-driven:** use `it.each([...])` for boundaries (at the threshold, just
  under, empty input). The existing `bench-stats.spec.ts` and `stats.spec.ts` are
  the style reference.
- **Honor the totality contract:** field functions should be **total** - return
  `0`/`null`/`[]` for empty input rather than throwing, matching `mean`/`stdev`/
  `round`. Test the empty case explicitly (it is the most common real bug).
- **Optional - property-based tests** for the stats invariants. If you add
  `fast-check` (dev dep), assert laws instead of points:

  ```ts
  import fc from 'fast-check';
  it('stdev is never negative and mean lies within [min,max]', () => {
    fc.assert(fc.property(fc.array(fc.double({ min: -1e6, max: 1e6 }), { minLength: 1 }), xs => {
      expect(stdev(xs)).toBeGreaterThanOrEqual(0);
      expect(mean(xs)).toBeGreaterThanOrEqual(Math.min(...xs));
      expect(mean(xs)).toBeLessThanOrEqual(Math.max(...xs));
    }));
  });
  ```

---

## 7. Rules of thumb + checklist

For every calculated field in a `*TransformService` or `*FeatureService` core:

- [ ] It has a **named function** in a `*.vm.ts` that returns just that value (or
      one cohesive group), named after the result.
- [ ] The function is **pure**: no `inject()`, no `HttpClient`, no Angular, no
      mutation of its inputs.
- [ ] It is **total**: defined for empty / null input (returns `0`/`null`/`[]`,
      never throws).
- [ ] Findings/optional outputs return `T | null`; the caller composes with
      `.filter(Boolean)`.
- [ ] Shared sub-calculations (means, gaps, percentiles, clustering) live in a
      **stats module** and are reused, not re-derived.
- [ ] The service/assembler does **no arithmetic** - it only fetches, calls the
      core, and assembles.
- [ ] There is a co-located `*.vm.spec.ts` with at least the boundary and empty
      cases, built with `Events`/`sample`/`parseClock`.

Net effect: the imperative shells stay swappable (Transform vs DataFile, ingest
vs browser) and untested-by-design, while the functional core is a flat set of
small functions you can read, reuse across ingest and runtime, and verify one
field at a time.
