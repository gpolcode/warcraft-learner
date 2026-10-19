import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, beginCast, cast, damage, removeBuff } from '../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { BACKSTAB, EVISCERATE, SHADOW_DANCE, WRATH } from '../../../../../../testing/spell-ids';
import type { PlanLine } from '../../plan/plan.models';
import type { WclEvent } from '../../wcl/wcl.models';
import { VERDICT_CHOICES } from '../../verdict/verdict-choices';
import { ListCheckService, LogReading } from './list-check-service';
import { LogEvents, factContext, priorityList } from './priority-list-harness';

const ENERGY = 3;
const COMBO_POINTS = 4;
const EVISCERATE_COST = 35;
const UNSEEN_BLADE_ENTRY = 117100;
const SHADOWSTRIKE = 185438;
const WRATH_CAST_S = 1.5;
const LOG_TICK_S = 0.001;
const PRESS_S = 10;
/** One log tick inside the reaction allowance before the press. */
const UNSEEN_S = PRESS_S - VERDICT_CHOICES.reactionS + LOG_TICK_S;
/** Exactly the allowance before the press. */
const SEEN_S = PRESS_S - VERDICT_CHOICES.reactionS;
const checks = TestBed.inject(ListCheckService);

const list = (lines: PlanLine[], over: { eviscerateCooldown?: number } = {}) => priorityList({
  lines,
  spells: {
    eviscerate: planSpell('Eviscerate', [EVISCERATE], { gcd: 1, costs: [{ type: ENERGY, amount: EVISCERATE_COST }], cooldown: over.eviscerateCooldown ?? 0 }),
    backstab: planSpell('Backstab', [BACKSTAB], { gcd: 1 }),
    shadowstrike: planSpell('Shadowstrike', [SHADOWSTRIKE], { gcd: 1 }),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { gcd: 0 }),
    wrath: planSpell('Wrath', [WRATH], { cast_time: WRATH_CAST_S }),
  },
  talents: { 'talent.unseen_blade': { name: 'Unseen Blade', entries: [UNSEEN_BLADE_ENTRY] } },
});
const pooled = (spellId: number, atS: number, cp: number, energy = 50) =>
  cast(spellId, atS, { resources: [{ type: ENERGY, amount: energy, max: 100 }, { type: COMBO_POINTS, amount: cp, max: 7 }] });
const read = (lines: PlanLine[], casts: WclEvent[], log: LogEvents = {}, over = {}): LogReading =>
  checks.read(factContext(list(lines, over), { casts, talents: [], ...log }));

describe('ListCheckService build terms', () => {
  const termsOf = (terms: string[], talents: [number, number][] = []) =>
    read([{ action: 'eviscerate', terms }], [pooled(EVISCERATE, 10, 5)], { talents }).casts.get('eviscerate')?.[0]?.lines[0]?.terms ?? [];

  it('marks a term the player\'s talents alone make hold, and not one that reads the moment', () => {
    const [talentTerm, momentTerm] = termsOf(['!talent.unseen_blade', 'combo_points>=5']);
    expect(talentTerm?.build).toBe(true);
    expect(momentTerm?.build).toBeUndefined();
  });

  it('marks a mixed term the talents settle whatever the moment, and not one the moment still decides', () => {
    expect(termsOf(['!(talent.unseen_blade&combo_points>=6)'])[0]?.build).toBe(true);
    expect(termsOf(['!(talent.unseen_blade&combo_points>=6)'], [[UNSEEN_BLADE_ENTRY, 1]])[0]?.build).toBeUndefined();
  });

  it('does not mark a talent term that fails, which names another build\'s line', () => {
    expect(termsOf(['talent.unseen_blade'])[0]?.build).toBeUndefined();
  });
});

describe('ListCheckService situation terms', () => {
  const SITUATION_TERMS = [
    'active_enemies>2', 'spell_targets.shuriken_storm>=2', 'target.health.pct<20', 'time<10', 'fight_remains<30',
    'target.time_to_die>8', 'raid_event.adds.in>20', 'fight_style.patchwerk',
  ];
  const situationTerms = (terms: string[]) => checks.buttons(list([{ action: 'eviscerate', terms }])).get('eviscerate')?.[0]?.situationTerms;

  it('marks a term that reads the enemy count, target health, the fight clock, a raid event or the fight style', () => {
    expect(situationTerms(SITUATION_TERMS)).toEqual(SITUATION_TERMS.map(() => true));
  });

  it('marks a term that mixes a talent with the situation, and not one that reads the player alone', () => {
    expect(situationTerms(['!(talent.unseen_blade&active_enemies>2)', 'talent.unseen_blade', 'combo_points>=5', 'health.pct<50'])).toEqual([true, false, false, false]);
  });
});

describe('ListCheckService cast check', () => {
  const EVISCERATE_LINES: PlanLine[] = [
    { action: 'eviscerate', terms: ['combo_points>=5'] },
    { action: 'eviscerate', terms: ['time>100', 'combo_points>=6'] },
  ];

  it('puts a cast on the list under the first line that holds', () => {
    const [check] = read(EVISCERATE_LINES, [pooled(EVISCERATE, 10, 5)]).casts.get('eviscerate') ?? [];
    expect(check).toMatchObject({ verdict: 'on', line: 0 });
  });

  it('puts a cast off the list when every line fails, closest to the line that fails the fewest terms', () => {
    const [check] = read(EVISCERATE_LINES, [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check).toMatchObject({ verdict: 'off', line: 0 });
  });

  it('ranks a line of another build behind every line of the player\'s own', () => {
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: ['talent.unseen_blade'] }, { action: 'eviscerate', terms: ['combo_points>=5', 'time>100'] }];
    const [check] = read(lines, [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check).toMatchObject({ verdict: 'off', line: 1 });
  });

  describe('closest line', () => {
    const CAST_S = 10;
    const COMBO_POINTS_HELD = 3;
    const BOSS = 1;
    const AOE = 'active_enemies>2';
    const SINGLE_TARGET = 'active_enemies<3';
    /** Fails at the cast's own second, the boundary of the comparison. */
    const LATE = `time>${CAST_S}`;
    const HOLDS = `combo_points>=${COMBO_POINTS_HELD}`;
    const SHORT = `combo_points>=${COMBO_POINTS_HELD + 1}`;
    const DANCING = 'buff.shadow_dance.up';
    /** The log shows Shadow Dance once, so the buff reads as down rather than unknown at the cast after it fades. */
    const DANCE_BEFORE_CAST = [applyBuff(SHADOW_DANCE, CAST_S - 2), removeBuff(SHADOW_DANCE, CAST_S - 1)];
    const line = (...terms: string[]): PlanLine => ({ action: 'eviscerate', terms });
    const onBossAlone = (lines: PlanLine[]) => read(lines, [pooled(EVISCERATE, CAST_S, COMBO_POINTS_HELD)], {
      buffs: DANCE_BEFORE_CAST, damage: [damage(BACKSTAB, CAST_S, 1, { target: BOSS })],
    }).casts.get('eviscerate')?.[0];

    it('ranks a line failing only an ordinary term ahead of an earlier line failing only a situation term', () => {
      expect(onBossAlone([line(AOE), line(DANCING)])).toMatchObject({ verdict: 'off', line: 1 });
    });

    it('weighs one failing situation term above every ordinary term a line fails', () => {
      expect(onBossAlone([line(AOE), line(DANCING, SHORT)])).toMatchObject({ verdict: 'off', line: 1 });
    });

    it('breaks a tie between lines for other situations toward the one more of whose terms hold', () => {
      expect(onBossAlone([line(HOLDS, AOE), line(HOLDS, SINGLE_TARGET, LATE)])).toMatchObject({ verdict: 'off', line: 1 });
    });

    it('breaks a tie between lines for other situations with as many terms holding toward the earlier one', () => {
      expect(onBossAlone([line(HOLDS, AOE), line(HOLDS, LATE)])).toMatchObject({ verdict: 'off', line: 0 });
    });

    it('ranks a line of another build behind a line failing only situation terms', () => {
      expect(onBossAlone([line('talent.unseen_blade', HOLDS), line(AOE, LATE)])).toMatchObject({ verdict: 'off', line: 1 });
    });
  });

  it('leaves a cast not judged when no line holds and one may', () => {
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: ['combo_points>=5|raid_event.movement.in>20'] }];
    const [check] = read(lines, [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check?.verdict).toBe('unjudged');
  });

  it('reads each operand of an either-or term on its own, down through a nested all-of group', () => {
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: ['combo_points>=5|(time<100&combo_points>=3)'] }];
    const [check] = read(lines, [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check?.lines[0]?.terms[0]).toEqual({
      truth: 'true', value: null,
      parts: [{ truth: 'false', value: [3, 3] }, { truth: 'true', value: null, parts: [{ truth: 'true', value: [10, 10] }, { truth: 'true', value: [3, 3] }] }],
    });
  });

  it('leaves a cast not judged under a line no parser reads', () => {
    const [check] = read([{ action: 'eviscerate', terms: null }], [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check?.verdict).toBe('unjudged');
  });
});

describe('ListCheckService one verdict per decision', () => {
  const ORDER: PlanLine[] = [{ action: 'eviscerate', terms: ['combo_points>=5'] }, { action: 'backstab', terms: [] }];
  const EVISCERATE_PRESSED = pooled(EVISCERATE, 30, 5);
  const pressAt = (reading: LogReading, action: string, atS: number) => reading.casts.get(action)?.find(check => check.atS === atS);

  it('charges a press to the pressed button when a higher button\'s line held while it was ready, naming that button', () => {
    expect(pressAt(read(ORDER, [pooled(BACKSTAB, 10, 5), EVISCERATE_PRESSED]), 'backstab', 10)).toMatchObject({ verdict: 'off', due: { action: 'eviscerate', line: 0 } });
  });

  it('charges nothing to the button that was due', () => {
    expect(checks.rightCounts(read(ORDER, [pooled(BACKSTAB, 10, 5), pooled(BACKSTAB, 11, 3)]), 'eviscerate')).toBeNull();
  });

  it('keeps the pressed button right when its line led the list', () => {
    const press = pressAt(read(ORDER, [pooled(BACKSTAB, 10, 3), EVISCERATE_PRESSED]), 'eviscerate', 30);
    expect(press?.verdict).toBe('on');
    expect(press?.due).toBeUndefined();
  });

  it('passes over a button still on cooldown', () => {
    const casts = [pooled(EVISCERATE, 5, 5), pooled(BACKSTAB, 10, 5), EVISCERATE_PRESSED];
    expect(pressAt(read(ORDER, casts, {}, { eviscerateCooldown: 30 }), 'backstab', 10)).toMatchObject({ verdict: 'on' });
  });

  it('decides nothing while a line above may or may not hold', () => {
    const lines: PlanLine[] = [{ action: 'shadowstrike', terms: ['raid_event.movement.in>20'] }, ...ORDER];
    const casts = [cast(SHADOWSTRIKE, 1), pooled(BACKSTAB, 10, 5), EVISCERATE_PRESSED];
    expect(pressAt(read(lines, casts), 'backstab', 10)?.due).toBeUndefined();
  });

  it('decides nothing when the pool may not cover the higher button\'s cost', () => {
    expect(pressAt(read(ORDER, [pooled(BACKSTAB, 10, 5, EVISCERATE_COST - 1), EVISCERATE_PRESSED]), 'backstab', 10)?.due).toBeUndefined();
  });

  it('counts a button the player never pressed this pull as due, its cooldown saying it was ready', () => {
    expect(pressAt(read(ORDER, [pooled(BACKSTAB, 10, 5)]), 'backstab', 10)).toMatchObject({ verdict: 'off', due: { action: 'eviscerate' } });
  });

  it('reads no higher button at a cast off the global cooldown', () => {
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: [] }, { action: 'shadow_dance', terms: [] }];
    expect(pressAt(read(lines, [cast(SHADOW_DANCE, 10), EVISCERATE_PRESSED]), 'shadow_dance', 10)?.due).toBeUndefined();
  });

  it('never ranks an off-GCD button above the press, since it does not take the global cooldown', () => {
    const lines: PlanLine[] = [{ action: 'shadow_dance', terms: [] }, ...ORDER];
    expect(pressAt(read(lines, [pooled(BACKSTAB, 10, 3)]), 'backstab', 10)).toMatchObject({ verdict: 'on' });
  });
});

describe('ListCheckService ownership from talents', () => {
  const SECRET_TECHNIQUE = 280719;
  const SECRET_TECHNIQUE_ENTRY = 112644;
  const LINES: PlanLine[] = [{ action: 'secret_technique', terms: [] }, { action: 'backstab', terms: [] }];
  const owned = (talents: [number, number][] | undefined) => {
    const base = list(LINES);
    const talented = { ...base, spells: { ...base.spells, secret_technique: planSpell('Secret Technique', [SECRET_TECHNIQUE], { gcd: 1 }) },
      talents: { 'talent.secret_technique': { name: 'Secret Technique', entries: [SECRET_TECHNIQUE_ENTRY] } } };
    return checks.read(factContext(talented, { casts: [cast(BACKSTAB, 10)], ...(talents ? { talents } : {}) })).casts.get('backstab')?.[0];
  };

  it('counts a never-pressed talent button as due once the player\'s talents pick it', () => {
    expect(owned([[SECRET_TECHNIQUE_ENTRY, 1]])).toMatchObject({ verdict: 'off', due: { action: 'secret_technique' } });
  });

  it('passes over it when the talents leave it out', () => {
    expect(owned([])).toMatchObject({ verdict: 'on' });
  });

  it('passes over it when the log shows no talent tree', () => {
    expect(owned(undefined)).toMatchObject({ verdict: 'on' });
  });
});

describe('ListCheckService idle decision points', () => {
  const ORDER: PlanLine[] = [{ action: 'eviscerate', terms: ['combo_points>=5'] }, { action: 'backstab', terms: [] }];
  /** Backstab spends its one-second global cooldown from 10 s; idle stretches are measured to a tenth of a second. */
  const GCD_END_S = 11;
  const backstabs = (nextS: number, cp = 5) => [pooled(BACKSTAB, 10, cp), pooled(BACKSTAB, nextS, cp)];
  const missed = (casts: WclEvent[]) => read(ORDER, casts).missed;

  it('charges a miss to the button that was due when an idle stretch outlasts the reaction allowance', () => {
    const OVER_S = GCD_END_S + 0.4;
    expect(missed(backstabs(OVER_S))).toEqual([expect.objectContaining({ action: 'eviscerate', kind: 'idle', atS: GCD_END_S + VERDICT_CHOICES.reactionS, line: 0 })]);
  });

  it('passes no decision in an idle stretch inside the reaction allowance', () => {
    const UNDER_S = GCD_END_S + 0.3;
    expect(missed(backstabs(UNDER_S))).toEqual([]);
  });

  it('charges nothing when no button was certainly due', () => {
    expect(missed(backstabs(20, 3)).filter(check => check.action === 'eviscerate')).toEqual([]);
  });

  it('reads the pool at an idle point between the casts either side, so a lower button can be the one due', () => {
    expect(missed(backstabs(20, 3))).toEqual([expect.objectContaining({ action: 'backstab', kind: 'idle' })]);
  });

  it('counts the miss among the due button\'s moments', () => {
    expect(checks.rightCounts(read(ORDER, backstabs(20)), 'eviscerate')).toMatchObject({ right: 0, moments: 1 });
  });
});

describe('ListCheckService off-GCD buttons held while due', () => {
  const DANCE_CD_S = 60;
  const LINES: PlanLine[] = [{ action: 'shadow_dance', terms: [] }, { action: 'backstab', terms: [] }];
  const presses = [cast(BACKSTAB, 10), cast(BACKSTAB, 11), cast(BACKSTAB, 12)];
  const readDance = (casts: WclEvent[]) => {
    const base = list(LINES);
    const danced = { ...base, spells: { ...base.spells, shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { gcd: 0, cooldown: DANCE_CD_S }) } };
    return checks.read(factContext(danced, { casts, talents: [] })).missed.filter(check => check.action === 'shadow_dance');
  };
  /** The next decision after 10 s is the press at 11 s; a dance up to the reaction allowance after it still answers the first. */
  const ANSWER_BY_S = 11 + VERDICT_CHOICES.reactionS;

  it('charges one miss per stretch between presses, however many decisions it sat ready for', () => {
    expect(readDance(presses)).toEqual([expect.objectContaining({ kind: 'held', atS: 10, line: 0 })]);
  });

  it('charges nothing when it was pressed by the reaction allowance after the next decision', () => {
    expect(readDance([...presses, cast(SHADOW_DANCE, ANSWER_BY_S)]).filter(check => check.atS === 10)).toEqual([]);
  });

  it('charges the decision when the press came one log tick later', () => {
    expect(readDance([...presses, cast(SHADOW_DANCE, ANSWER_BY_S + LOG_TICK_S)]).filter(check => check.atS === 10)).toHaveLength(1);
  });
});

describe('ListCheckService enemy-count strata', () => {
  const LINES: PlanLine[] = [{ action: 'eviscerate', terms: [] }];
  const hits = (targets: number) => Array.from({ length: targets }, (_, target) => damage(EVISCERATE, PRESS_S + 1, 1, { target }));
  const strataOf = (targets: number) => checks.rightCounts(read(LINES, [pooled(EVISCERATE, PRESS_S, 5)], { damage: hits(targets) }), 'eviscerate')?.strata;

  it('counts a moment on one enemy apart from one on several', () => {
    expect(strataOf(1)).toEqual({ single: { right: 1, moments: 1, unjudged: 0 } });
    expect(strataOf(2)).toEqual({ multi: { right: 1, moments: 1, unjudged: 0 } });
  });

  it('counts a moment the log shows no enemy for as unknown', () => {
    expect(strataOf(0)).toEqual({ unknown: { right: 1, moments: 1, unjudged: 0 } });
  });
});

describe('ListCheckService reaction allowance', () => {
  const ON_DANCE: PlanLine[] = [{ action: 'eviscerate', terms: ['buff.shadow_dance.up'] }];
  const ORDER: PlanLine[] = [...ON_DANCE, { action: 'backstab', terms: [] }];
  const droppedAt = (atS: number) => ({ buffs: [applyBuff(SHADOW_DANCE, 1), removeBuff(SHADOW_DANCE, atS)] });
  const appliedAt = (atS: number) => ({ buffs: [applyBuff(SHADOW_DANCE, atS)] });
  const castOf = (reading: LogReading) => reading.casts.get('eviscerate')?.[0];
  const skipAt = (reading: LogReading) => reading.casts.get('backstab')?.find(check => check.atS === PRESS_S)?.due;

  it('leaves a press not judged when its line fails only on an aura that changed inside the allowance', () => {
    expect(castOf(read(ON_DANCE, [pooled(EVISCERATE, PRESS_S, 5)], droppedAt(UNSEEN_S)))).toMatchObject({ verdict: 'unjudged' });
  });

  it('puts that press off the list when the aura changed exactly the allowance before it', () => {
    expect(castOf(read(ON_DANCE, [pooled(EVISCERATE, PRESS_S, 5)], droppedAt(SEEN_S)))).toMatchObject({ verdict: 'off' });
  });

  it('keeps a press on the list when its line holds on an aura that changed inside the allowance', () => {
    expect(castOf(read(ON_DANCE, [pooled(EVISCERATE, PRESS_S, 5)], appliedAt(UNSEEN_S)))).toMatchObject({ verdict: 'on' });
  });

  it('names no higher button due when its line holds only on an aura that changed inside the allowance', () => {
    const casts = [pooled(BACKSTAB, PRESS_S, 5), pooled(EVISCERATE, 30, 5)];
    expect(skipAt(read(ORDER, casts, appliedAt(UNSEEN_S)))).toBeUndefined();
  });

  it('names it due when that aura changed exactly the allowance before the press', () => {
    const casts = [pooled(BACKSTAB, PRESS_S, 5), pooled(EVISCERATE, 30, 5)];
    expect(skipAt(read(ORDER, casts, appliedAt(SEEN_S)))).toMatchObject({ action: 'eviscerate' });
  });
});

describe('ListCheckService hardcasts', () => {
  const ON_DANCE: PlanLine[] = [{ action: 'wrath', terms: ['buff.shadow_dance.up'] }];
  const BEGUN_S = 10;
  const DONE_S = BEGUN_S + WRATH_CAST_S;
  /** Dance drops while the cast bar fills. */
  const dance = { buffs: [applyBuff(SHADOW_DANCE, 1), removeBuff(SHADOW_DANCE, BEGUN_S + WRATH_CAST_S / 2)] };
  const wrathOf = (reading: LogReading) => reading.casts.get('wrath')?.[0];

  it('judges a hardcast at its begincast, where the list chose it', () => {
    expect(wrathOf(read(ON_DANCE, [beginCast(WRATH, BEGUN_S), cast(WRATH, DONE_S)], dance))).toMatchObject({ atS: BEGUN_S, verdict: 'on' });
  });

  it('reads the last press as the one before the begincast, not one pressed while the cast bar filled', () => {
    const lines: PlanLine[] = [{ action: 'wrath', terms: ['!prev.shadow_dance'] }];
    const casts = [beginCast(WRATH, BEGUN_S), cast(SHADOW_DANCE, BEGUN_S + WRATH_CAST_S / 2), cast(WRATH, DONE_S)];
    expect(wrathOf(read(lines, casts))).toMatchObject({ verdict: 'on' });
  });

  it('judges an instant cast of the same spell at the cast itself', () => {
    expect(wrathOf(read(ON_DANCE, [cast(WRATH, DONE_S)], dance))).toMatchObject({ atS: DONE_S, verdict: 'off' });
  });
});

describe('ListCheckService.streams', () => {
  it('asks for the streams the list\'s facts read and no others', () => {
    const streams = (terms: string[]) => [...checks.streams(list([{ action: 'eviscerate', terms }]))];
    expect(streams(['active_enemies>=2'])).toEqual(['damage']);
    expect(streams(['buff.shadow_dance.up'])).toEqual([]);
  });

  it('asks for the gear when the list has a trinket line, to resolve it to the trinket worn', () => {
    expect([...checks.streams(priorityList({ lines: [{ action: 'use_item', terms: [], item: 'trinket1' }] }))]).toEqual(['gear']);
  });

  it('asks for what a replayed variable reads', () => {
    const replayed = priorityList({ lines: [{ action: 'eviscerate', terms: ['variable.spread'] }], variables: [{ name: 'spread', op: 'set', value: 'active_enemies', terms: [] }] });
    expect([...checks.streams(replayed)]).toEqual(['damage']);
  });
});

describe('ListCheckService variables', () => {
  it('judges a line on a variable by its value at the cast', () => {
    const variables = [{ name: 'ready', op: 'set', value: 'combo_points>=5', terms: [] }];
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: ['variable.ready'] }];
    const reading = checks.read(factContext({ ...list(lines), variables }, { casts: [pooled(EVISCERATE, 10, 5), pooled(EVISCERATE, 20, 3)], talents: [] }));
    expect(reading.casts.get('eviscerate')?.map(check => check.verdict)).toEqual(['on', 'off']);
  });
});
