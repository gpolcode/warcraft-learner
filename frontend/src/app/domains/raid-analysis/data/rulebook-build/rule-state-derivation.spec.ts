import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RuleStateDerivationService } from './rule-state-derivation-service';
import { AbilityIndexService } from './ability-index-service';
import { AplLiteralService } from './apl-literal-service';
import { RuleGateService } from './rule-gate-service';
import { SimcExpressionService } from '../simc/simc-expression-service';
import type { AplExpr, SpellRecord } from '../simc/simc.models';
import type { ActionGroup, ActionLine, AuraLookup, DraftSeed } from './rule-derivation.models';
import type { ParseSample } from './rulebook-build.models';
import type { RuleCondition } from '../rulebook/rulebook.models';
import { builder, enemyDot, finisher, selfAura, spellRecord } from '../../../../../testing/builders/simc';
import { parseSample } from '../../../../../testing/builders/parse-sample';
import { applyBuff, buffWindow, cast, removeBuff } from '../../../../../testing/builders/events';
import {
  BACKSTAB, DARKEST_NIGHT, EVISCERATE, GLOOMBLADE, RUPTURE, SECRET_TECHNIQUE, SHADOW_BLADES, SHADOW_DANCE, SHADOW_DANCE_AURA, SHADOWSTRIKE, SLICE_AND_DICE,
} from '../../../../../testing/spell-ids';

const states = TestBed.inject(RuleStateDerivationService);
const abilities = TestBed.inject(AbilityIndexService);
const literals = TestBed.inject(AplLiteralService);
const gates = TestBed.inject(RuleGateService);
const expressions = TestBed.inject(SimcExpressionService);

const CLASS = 'Rogue';
const SPEC = 'Subtlety';
const FIGHT_S = 100;
/** An aura up for 70 of 100 seconds sits on the maintained floor. */
const MAINTAINED_S = 70;
/** A buff of 30s is the longest that still counts as a proc. */
const PROC_MAX_DURATION_S = 30;
/** Three applications is the floor for a proc the parses vouch for. */
const MIN_PROC_APPLICATIONS = 3;
/** Spending two of four applications is exactly the consumed share. */
const PROC_APPLICATIONS = 4;
const SPENT_AT_SHARE = 2;

const SHADOWSTRIKE_RECORD = builder(SHADOWSTRIKE, 'Shadowstrike');
const BACKSTAB_RECORD = builder(BACKSTAB, 'Backstab');
const GLOOMBLADE_RECORD = builder(GLOOMBLADE, 'Gloomblade');
const EVISCERATE_RECORD = finisher(EVISCERATE, 'Eviscerate');
const RUPTURE_RECORD = finisher(RUPTURE, 'Rupture', { effects: [enemyDot()], durationS: 24 });
const SECRET_TECHNIQUE_RECORD = finisher(SECRET_TECHNIQUE, 'Secret Technique', { rechargeS: 25 });
const SHADOW_DANCE_RECORD = spellRecord({ id: SHADOW_DANCE, name: 'Shadow Dance', gcd: false, rechargeS: 20, durationS: 6, effects: [selfAura()] });
const SHADOW_BLADES_RECORD = spellRecord({ id: SHADOW_BLADES, name: 'Shadow Blades', gcd: false, cooldownS: 90, durationS: 20, effects: [selfAura()] });
const KIT = [
  SHADOWSTRIKE_RECORD, BACKSTAB_RECORD, GLOOMBLADE_RECORD, EVISCERATE_RECORD, RUPTURE_RECORD, SECRET_TECHNIQUE_RECORD, SHADOW_DANCE_RECORD, SHADOW_BLADES_RECORD,
  spellRecord({ id: SHADOW_DANCE_AURA, name: 'Shadow Dance', durationS: 6, effects: [selfAura()] }),
  spellRecord({ id: SLICE_AND_DICE, name: 'Slice and Dice', durationS: 30, effects: [selfAura()] }),
  spellRecord({ id: DARKEST_NIGHT, name: 'Darkest Night', durationS: PROC_MAX_DURATION_S, effects: [selfAura()] }),
];

function parsed(source: string): AplExpr {
  const expr = expressions.parse(source);
  if (!expr) throw new Error(`${source} did not parse`);
  return expr;
}

/** A line as the derivation sees it: its terms as facts, the facts every term shares, and the talent gate they carry. */
function line(action: string, record: SpellRecord, gate: string | null, priority: number): ActionLine {
  const own = gate === null ? null : parsed(gate);
  const terms = (expressions.termsOf(own, []) ?? []).map(term => literals.facts(term));
  const lineFacts = gates.everyTerm(terms);
  return { resolved: { action, own, context: [], priority }, record, terms, lineFacts, ...gates.talentGate([...lineFacts.values()]) };
}

function groupsOf(lines: ActionLine[]): ActionGroup[] {
  const byToken = new Map<string, ActionGroup>();
  for (const entry of lines) {
    const group = byToken.get(entry.resolved.action) ?? { token: entry.resolved.action, record: entry.record, lines: [] };
    group.lines.push(entry);
    byToken.set(entry.resolved.action, group);
  }
  return [...byToken.values()];
}

/** Shadow Dance seen as the aura twin for a lasting share, so the lookup resolves it and the state counts. */
const BASE_SAMPLE = parseSample({ fightDurationS: FIGHT_S, buffs: buffWindow(SHADOW_DANCE_AURA, 0, 20) });

function setup(samples: ParseSample[] = [BASE_SAMPLE], kit = KIT) {
  const index = abilities.build(kit, samples, CLASS, SPEC);
  const aura: AuraLookup = (token, scope) => abilities.aura(index, token, scope);
  return { index, aura };
}

function ofKind<K extends RuleCondition['kind']>(seeds: DraftSeed[], kind: K): Extract<RuleCondition, { kind: K }>[] {
  return seeds.flatMap(seed => (seed.condition.kind === kind ? [seed.condition as Extract<RuleCondition, { kind: K }>] : []));
}

const distinct = <T>(conditions: T[]): T[] => [...new Map(conditions.map(condition => [JSON.stringify(condition), condition])).values()];

describe('RuleStateDerivationService.fillerRules', () => {
  const { index, aura } = setup();
  const lines = [
    line('shadowstrike', SHADOWSTRIKE_RECORD, 'buff.shadow_dance.up', 0),
    line('eviscerate', EVISCERATE_RECORD, '!buff.shadow_dance.up', 1),
    line('gloomblade', GLOOMBLADE_RECORD, '!buff.shadow_dance.up', 2),
    line('backstab', BACKSTAB_RECORD, '!buff.shadow_dance.up', 3),
  ];

  it('reads the builder pressed inside a state from the same-pool builders gated outside it, never a finisher', () => {
    const [inDance] = distinct(ofKind(states.fillerRules(lines, index, aura), 'filler_in_buff'));
    expect(inDance).toMatchObject({ spell_id: SHADOWSTRIKE, buff_spell_id: SHADOW_DANCE_AURA });
    expect(inDance?.alternative_spell_ids.sort((a, b) => a - b)).toEqual([BACKSTAB, GLOOMBLADE]);
  });

  it('reads the same rule from a line gated outside the state, taking the nearest same-pool filler above it', () => {
    const outsideOnly = [line('shadowstrike', SHADOWSTRIKE_RECORD, null, 0), line('backstab', BACKSTAB_RECORD, '!buff.shadow_dance.up', 1)];
    const [inDance] = ofKind(states.fillerRules(outsideOnly, index, aura), 'filler_in_buff');
    expect(inDance).toMatchObject({ spell_id: SHADOWSTRIKE, alternative_spell_ids: [BACKSTAB] });
  });

  it('writes nothing for a state the sampled parses saw for less than a lasting share', () => {
    const fleeting = setup([parseSample({ buffs: buffWindow(SHADOW_DANCE_AURA, 0, 4), fightDurationS: FIGHT_S })]);
    expect(states.fillerRules(lines, fleeting.index, fleeting.aura)).toEqual([]);
  });
});

describe('RuleStateDerivationService.procRules', () => {
  const groups = groupsOf([line('eviscerate', EVISCERATE_RECORD, 'buff.darkest_night.up', 0)]);
  const procs = (applications: number, spent: number, kit = KIT) => {
    const sample = parseSample({
      fightDurationS: FIGHT_S,
      casts: Array.from({ length: spent }, (_, index) => cast(EVISCERATE, 12 + index * 20)),
      buffs: Array.from({ length: applications }, (_, index) => [applyBuff(DARKEST_NIGHT, 10 + index * 20), removeBuff(DARKEST_NIGHT, 14 + index * 20)]).flat(),
    });
    const { index, aura } = setup([sample], kit);
    return ofKind(states.procRules(groups, index, [sample], aura), 'proc_wasted');
  };

  it('reads a short buff spent in half its windows as a proc to spend on sight, and drops one spent in fewer', () => {
    expect(procs(PROC_APPLICATIONS, SPENT_AT_SHARE)[0]).toMatchObject({ buff_spell_id: DARKEST_NIGHT, spend_spell_ids: [EVISCERATE] });
    expect(procs(PROC_APPLICATIONS, SPENT_AT_SHARE - 1)).toEqual([]);
  });

  it('needs the floor count of applications', () => {
    expect(procs(MIN_PROC_APPLICATIONS, MIN_PROC_APPLICATIONS)).toHaveLength(1);
    expect(procs(MIN_PROC_APPLICATIONS - 1, MIN_PROC_APPLICATIONS - 1)).toEqual([]);
  });

  it('drops a buff that outlasts the proc ceiling', () => {
    const lasting = KIT.map(record => (record.id === DARKEST_NIGHT ? { ...record, durationS: PROC_MAX_DURATION_S + 1 } : record));
    expect(procs(PROC_APPLICATIONS, PROC_APPLICATIONS, lasting)).toEqual([]);
  });
});

describe('RuleStateDerivationService.uptimeRules', () => {
  const lines = [line('eviscerate', EVISCERATE_RECORD, '!buff.slice_and_dice.up', 0), line('shadow_blades', SHADOW_BLADES_RECORD, '!buff.shadow_dance.up', 1)];
  const uptimes = (sliceAndDiceS: number) => {
    const { index, aura } = setup([parseSample({ fightDurationS: FIGHT_S, buffs: [...buffWindow(SLICE_AND_DICE, 0, sliceAndDiceS), ...buffWindow(SHADOW_DANCE_AURA, 0, FIGHT_S)] })]);
    return ofKind(states.uptimeRules(lines, index, aura), 'aura_uptime_below').map(condition => condition.aura_spell_id);
  };

  it('keeps an aura the parses hold up for the floor share and drops one just under it', () => {
    expect(uptimes(MAINTAINED_S)).toContain(SLICE_AND_DICE);
    expect(uptimes(MAINTAINED_S - 1)).not.toContain(SLICE_AND_DICE);
  });

  it('never reads a major cooldown\'s own aura as upkeep', () => {
    expect(uptimes(MAINTAINED_S)).not.toContain(SHADOW_DANCE_AURA);
  });
});

describe('RuleStateDerivationService.clipRules', () => {
  const { aura } = setup();

  it('reads a refreshable gate on the action\'s own dot as a clip rule, suspended inside the states that refresh it regardless', () => {
    const groups = groupsOf([line('rupture', RUPTURE_RECORD, 'dot.rupture.refreshable', 0), line('rupture', RUPTURE_RECORD, 'buff.darkest_night.up', 1)]);
    const [clip] = ofKind(states.clipRules(groups, aura), 'aura_clipped');
    expect(clip).toMatchObject({ aura_spell_id: RUPTURE, cast_spell_id: RUPTURE, on: 'target', except_buff_spell_ids: [DARKEST_NIGHT] });
  });

  it('writes nothing for a dot no line refreshes on its window', () => {
    expect(states.clipRules(groupsOf([line('rupture', RUPTURE_RECORD, 'combo_points>=5', 0)]), aura)).toEqual([]);
  });
});

describe('RuleStateDerivationService.cooldownPairingRules', () => {
  const { index } = setup();

  it('pairs a cast with the cooldown it waits for and holds one for the anchor it keeps clear of', () => {
    const groups = groupsOf([
      line('shadow_blades', SHADOW_BLADES_RECORD, 'cooldown.shadow_dance.charges_fractional>=1', 0),
      line('shadow_dance', SHADOW_DANCE_RECORD, 'cooldown.shadow_blades.remains>=35', 1),
    ]);
    const seeds = states.cooldownPairingRules(groups, index);
    expect(ofKind(seeds, 'cast_without_prior')[0]).toMatchObject({ spell_id: SHADOW_BLADES, required_spell_id: SHADOW_DANCE, position: 'after' });
    expect(ofKind(seeds, 'hold_cooldown_for_anchor')[0]).toMatchObject({ spell_ids: [SHADOW_DANCE], anchor_spell_id: SHADOW_BLADES });
  });

  it('keeps the hold and drops the pairing when one cooldown is both held for and paired with an anchor', () => {
    const groups = groupsOf([
      line('shadow_dance', SHADOW_DANCE_RECORD, 'cooldown.shadow_blades.remains>=35', 0),
      line('shadow_dance', SHADOW_DANCE_RECORD, 'cooldown.shadow_blades.remains<=5', 1),
    ]);
    const seeds = states.cooldownPairingRules(groups, index);
    expect(ofKind(seeds, 'hold_cooldown_for_anchor')).toHaveLength(1);
    expect(ofKind(seeds, 'cast_without_prior')).toEqual([]);
  });

  it('never pairs a filler, whose gate on a cooldown is a rotation state, not a pairing', () => {
    const groups = groupsOf([line('backstab', BACKSTAB_RECORD, 'cooldown.shadow_blades.ready', 0)]);
    expect(states.cooldownPairingRules(groups, index)).toEqual([]);
  });
});
