import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { PressFold, PressLog, WclProjectionsService } from './wcl-projections-service';
import {
  ANTI_MAGIC_SHELL, BLUR, BLUR_BUFF, DIVINE_HYMN, DIVINE_HYMN_TICK, POWER_INFUSION, SHADOW_BLADES, THE_HUNT, THE_HUNT_LANDING,
  WCL_SYNTHETIC_SOURCE_FALLBACK_ID,
} from '../../../../../testing/spell-ids';
import { applyBuff, applyBuffStack, cast, refreshBuff } from '../../../../../testing/builders/events';
import { ParseRanking, WclEvent } from '../wcl/wcl.models';
import type { PlanCooldown } from '../plan/plan.models';
import { TestBed } from '@angular/core/testing';

const wclProjections = TestBed.inject(WclProjectionsService);

const rankingRow = (name: string, code: string, fightID: number) => ({ name, report: { code, fightID } });

const TWISTING_NETHER = 'Twisting Nether';
const AREA_52 = 'Area 52';

describe('unwrapRankings', () => {
  it('parses the JSON blob string form and returns its rankings', () => {
    const blob = JSON.stringify({ rankings: [rankingRow('Keep', 'r1', 3)] });
    expect(wclProjections.unwrapRankings(blob)).toEqual([rankingRow('Keep', 'r1', 3)]);
  });

  it('reads the already-parsed object form directly', () => {
    expect(wclProjections.unwrapRankings({ rankings: [rankingRow('Keep', 'r1', 3)] })).toEqual([rankingRow('Keep', 'r1', 3)]);
  });

  it('returns [] for a null / empty blob or a blob with no rankings key', () => {
    expect(wclProjections.unwrapRankings(null)).toEqual([]);
    expect(wclProjections.unwrapRankings(undefined)).toEqual([]);
    expect(wclProjections.unwrapRankings('')).toEqual([]);
    expect(wclProjections.unwrapRankings({})).toEqual([]);
  });

  it('returns [] without throwing for an unparseable string blob, warning for repro', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => wclProjections.unwrapRankings('{ not json')).not.toThrow();
    expect(wclProjections.unwrapRankings('{ not json')).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('composes with toParseRankings to yield fetchable parses', () => {
    const blob = JSON.stringify({ rankings: [rankingRow('Keep', 'r1', 3)] });
    expect(wclProjections.toParseRankings(wclProjections.unwrapRankings(blob), 10)).toEqual([{ player: 'Keep', server: '', report_code: 'r1', fight_id: 3 }]);
  });
});

describe('toParseRankings', () => {
  it('maps raw rankings to fetchable parses and caps at count', () => {
    const raw = [rankingRow('P1', 'r1', 1), rankingRow('P2', 'r2', 2), rankingRow('P3', 'r3', 3)];
    expect(wclProjections.toParseRankings(raw, 2)).toEqual([
      { player: 'P1', server: '', report_code: 'r1', fight_id: 1 },
      { player: 'P2', server: '', report_code: 'r2', fight_id: 2 },
    ]);
  });

  it('carries the ranked character\'s realm, and an empty realm when the row omits it', () => {
    const raw = [{ ...rankingRow('P1', 'r1', 1), server: { name: TWISTING_NETHER } }, rankingRow('P2', 'r2', 2)];
    expect(wclProjections.toParseRankings(raw, 10).map(ranking => ranking.server)).toEqual([TWISTING_NETHER, '']);
  });

  it('drops anonymized "Character <id>-<id>" names and rows without a report code', () => {
    const raw = [
      rankingRow('Character 123-456', 'r1', 1), // privacy-anonymized parse
      { name: 'NoReport', report: { fightID: 2 } }, // report code missing -> unfetchable
      rankingRow('Keep', 'r3', 3),
    ];
    expect(wclProjections.toParseRankings(raw, 10)).toEqual([{ player: 'Keep', server: '', report_code: 'r3', fight_id: 3 }]);
  });
});

describe('findParseActor', () => {
  const RANKED_NAME = 'Keep';
  const TWIN_ID = 20;
  const actor = (id: number, name: string, server: string) => ({ id, name, subType: 'Rogue', server });
  const ranked = (server: string): ParseRanking => ({ player: RANKED_NAME, server, report_code: 'r1', fight_id: 1 });

  it('binds the one actor carrying the ranked name', () => {
    const actors = [actor(10, 'Other', AREA_52), actor(TWIN_ID, RANKED_NAME, TWISTING_NETHER)];
    expect(wclProjections.findParseActor(actors, ranked(TWISTING_NETHER))?.id).toBe(TWIN_ID);
  });

  it('binds a lone name match even when its realm differs from the ranked realm', () => {
    expect(wclProjections.findParseActor([actor(TWIN_ID, RANKED_NAME, TWISTING_NETHER)], ranked(AREA_52))?.id).toBe(TWIN_ID);
  });

  it('is null when no actor carries the ranked name, and for an absent actor list', () => {
    expect(wclProjections.findParseActor([actor(10, 'Other', AREA_52)], ranked(AREA_52))).toBeNull();
    expect(wclProjections.findParseActor(undefined, ranked(AREA_52))).toBeNull();
  });

  it('separates two same-named raiders by realm, ignoring spacing and case', () => {
    const actors = [actor(10, RANKED_NAME, 'Twisting-Nether'), actor(TWIN_ID, RANKED_NAME, 'area 52')];
    expect(wclProjections.findParseActor(actors, ranked(AREA_52))?.id).toBe(TWIN_ID);
  });

  it('is null for two same-named raiders when the ranking carries no realm', () => {
    const actors = [actor(10, RANKED_NAME, TWISTING_NETHER), actor(TWIN_ID, RANKED_NAME, AREA_52)];
    expect(wclProjections.findParseActor(actors, ranked(''))).toBeNull();
  });

  it('is null for two same-named raiders when neither sits on the ranked realm', () => {
    const actors = [actor(10, RANKED_NAME, TWISTING_NETHER), actor(TWIN_ID, RANKED_NAME, '')];
    expect(wclProjections.findParseActor(actors, ranked(AREA_52))).toBeNull();
  });
});

describe('abilityIcons', () => {
  const SHADOW_BLADES = 121471;
  const CLOAK = 31224;

  it('keys by ability id and strips the trailing .jpg (case-insensitive)', () => {
    const raw = {
      [`a${SHADOW_BLADES}`]: { id: SHADOW_BLADES, name: 'Shadow Blades', icon: 'ability_sb.jpg' },
      [`a${CLOAK}`]: { id: CLOAK, name: 'Cloak of Shadows', icon: 'spell_cloak.JPG' },
    };
    expect(wclProjections.abilityIcons(raw)).toEqual({
      [SHADOW_BLADES]: { icon: 'ability_sb', name: 'Shadow Blades' },
      [CLOAK]: { icon: 'spell_cloak', name: 'Cloak of Shadows' },
    });
  });

  it('skips null entries (ids WCL could not resolve) and returns {} for an empty map', () => {
    const raw = { [`a${SHADOW_BLADES}`]: null };
    expect(wclProjections.abilityIcons(raw)).toEqual({});
    expect(wclProjections.abilityIcons({})).toEqual({});
  });

  it('leaves an icon with no .jpg extension untouched', () => {
    const raw = { [`a${SHADOW_BLADES}`]: { id: SHADOW_BLADES, name: 'Shadow Blades', icon: 'ability_sb' } };
    expect(wclProjections.abilityIcons(raw)).toEqual({ [SHADOW_BLADES]: { icon: 'ability_sb', name: 'Shadow Blades' } });
  });

  it('projects a resolved entry with a null icon to an empty icon (name-only)', () => {
    const raw = { [`a${SHADOW_BLADES}`]: { id: SHADOW_BLADES, name: 'Shadow Blades', icon: null } };
    expect(wclProjections.abilityIcons(raw)).toEqual({ [SHADOW_BLADES]: { icon: '', name: 'Shadow Blades' } });
  });

});

describe('windowSpells', () => {
  const SHADOW_BLADES = 121471;
  const UNKNOWN_SPELL_ID = 999999; // an id the ability map never resolved
  const abilities = { [SHADOW_BLADES]: { icon: 'ability_sb', name: 'Shadow Blades' } };

  let warnSpy: MockInstance<typeof console.warn>;
  beforeEach(() => { warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined); });
  afterEach(() => { warnSpy.mockRestore(); });

  it('resolves a known id to its baked icon and name', () => {
    expect(wclProjections.windowSpells([SHADOW_BLADES], abilities)).toEqual([
      { id: SHADOW_BLADES, icon: 'ability_sb', name: 'Shadow Blades' },
    ]);
  });

  it('emits a labelled empty-icon placeholder for an unknown id without throwing', () => {
    expect(() => wclProjections.windowSpells([UNKNOWN_SPELL_ID], abilities)).not.toThrow();
    expect(wclProjections.windowSpells([UNKNOWN_SPELL_ID], abilities)).toEqual([
      { id: UNKNOWN_SPELL_ID, icon: '', name: `Ability #${UNKNOWN_SPELL_ID}` },
    ]);
  });

  it('falls back to the placeholder label when the map resolved the id but WCL left it unnamed', () => {
    // WCL declares every ability field nullable, so a bench can carry a resolved id whose name never arrived.
    const unnamed = { [SHADOW_BLADES]: { icon: 'ability_sb', name: null as unknown as string } };
    expect(wclProjections.windowSpells([SHADOW_BLADES], unnamed)).toEqual([
      { id: SHADOW_BLADES, icon: 'ability_sb', name: `Ability #${SHADOW_BLADES}` },
    ]);
  });

  it('warns with the missing id so a bug report can reproduce it', () => {
    wclProjections.windowSpells([UNKNOWN_SPELL_ID], abilities);
    // logWarn(context, id) lands as two console.warn args: '[warcraft-learner] <context>:', id.
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('windowSpells'), UNKNOWN_SPELL_ID);
  });
});

describe('normalizeAbilityId', () => {
  it('maps the WCL melee event id (which gameData resolves to "Word of Recall (OLD)") to Auto Attack', () => {
    // Independent literals, not the SUT constants, so a drift in either wire value fails here.
    const WCL_MELEE_WIRE_ID = 1;
    const AUTO_ATTACK_GAME_SPELL_ID = 6603;
    expect(wclProjections.normalizeAbilityId(WCL_MELEE_WIRE_ID)).toBe(AUTO_ATTACK_GAME_SPELL_ID);
  });

  it('folds every negative (synthetic, sourceless) id onto the "I Don\'t Know" catch-all', () => {
    // -32 is the priest-log id that warned; any negative id WCL synthesizes maps the same way.
    const SHADOWFIEND_MELEE = -32;
    const ENVIRONMENTAL = -5;
    expect(wclProjections.normalizeAbilityId(SHADOWFIEND_MELEE)).toBe(WCL_SYNTHETIC_SOURCE_FALLBACK_ID);
    expect(wclProjections.normalizeAbilityId(ENVIRONMENTAL)).toBe(WCL_SYNTHETIC_SOURCE_FALLBACK_ID);
  });

  it('passes other ability ids through unchanged', () => {
    const SHADOW_BLADES = 121471;
    expect(wclProjections.normalizeAbilityId(SHADOW_BLADES)).toBe(SHADOW_BLADES);
  });
});

const POWER_INFUSION_S = 15;
const POWER_INFUSION_COOLDOWN_S = 120;
const ANTI_MAGIC_SHELL_MERGED_DURATION_S = 45;
const ANTI_MAGIC_SHELL_COOLDOWN_S = 60;
const ANTI_MAGIC_SHELL_BUTTON = {
  name: 'Anti-Magic Shell', spell_id: ANTI_MAGIC_SHELL, cooldown: ANTI_MAGIC_SHELL_COOLDOWN_S, duration: ANTI_MAGIC_SHELL_MERGED_DURATION_S, charges: 1,
};
const ability = (gameID: number, name: string) => ({ gameID, name, icon: '' });

describe('pressFolds', () => {
  // Mirrors the service's floor, so changing one without the other un-pins the boundary below.
  const FOLDING_COOLDOWN_S = 60;
  const powerInfusion = (over: Partial<PlanCooldown> = {}): PlanCooldown => ({
    name: 'Power Infusion', spell_id: POWER_INFUSION, cooldown: POWER_INFUSION_COOLDOWN_S, duration: POWER_INFUSION_S, charges: 1, ...over,
  });

  it('folds a one-charge button inside its own aura duration', () => {
    expect(wclProjections.pressFolds([powerInfusion()])).toEqual([{ name: 'Power Infusion', spell_id: POWER_INFUSION, window_s: POWER_INFUSION_S }]);
  });

  it('caps the window at half the cooldown when the merged duration runs longer', () => {
    const HALF_COOLDOWN_S = ANTI_MAGIC_SHELL_COOLDOWN_S / 2;
    expect(wclProjections.pressFolds([ANTI_MAGIC_SHELL_BUTTON])[0]?.window_s).toBe(HALF_COOLDOWN_S);
  });

  it('folds nothing for a button with a second charge, which presses again inside its own aura', () => {
    expect(wclProjections.pressFolds([powerInfusion({ charges: 2 })])).toEqual([]);
  });

  it('folds a button on a minute-long cooldown, and nothing for one on a shorter cooldown', () => {
    expect(wclProjections.pressFolds([powerInfusion({ cooldown: FOLDING_COOLDOWN_S })])).toHaveLength(1);
    expect(wclProjections.pressFolds([powerInfusion({ cooldown: FOLDING_COOLDOWN_S - 1 })])).toEqual([]);
  });

  it('folds nothing for a button that a bench an older ingest wrote carries without its duration', () => {
    expect(wclProjections.pressFolds([{ name: 'Power Infusion', spell_id: POWER_INFUSION, cooldown: POWER_INFUSION_COOLDOWN_S }])).toEqual([]);
  });
});

describe('presses', () => {
  const PRIEST_ID = 5;
  const ALLY_ID = 9;
  const PRESS_S = 30;
  const ECHO_S = 0.01;
  const JUST_UNDER_S = 0.001;
  const NO_AURAS: PressLog = { buffs: [], abilities: [] };
  const powerInfusion: PressFold = { name: 'Power Infusion', spell_id: POWER_INFUSION, window_s: POWER_INFUSION_S };
  const press = (atS: number, target = ALLY_ID) => cast(POWER_INFUSION, atS, { source: PRIEST_ID, target });
  const folded = (casts: WclEvent[], folds: PressFold[] = [powerInfusion], log = NO_AURAS) => wclProjections.presses(casts, folds, log);

  it('keeps one cast for a press WCL logs on its target and again on the caster, in the same ms or a few ms later', () => {
    expect(folded([press(PRESS_S), press(PRESS_S, PRIEST_ID)])).toEqual([press(PRESS_S)]);
    expect(folded([press(PRESS_S), press(PRESS_S + ECHO_S, PRIEST_ID)])).toEqual([press(PRESS_S)]);
  });

  it('folds a repeat just under the fold window, and keeps one exactly at it', () => {
    expect(folded([press(PRESS_S), press(PRESS_S + POWER_INFUSION_S - JUST_UNDER_S)])).toHaveLength(1);
    expect(folded([press(PRESS_S), press(PRESS_S + POWER_INFUSION_S)])).toHaveLength(2);
  });

  it('folds a cast of another id the report names like the button, as The Hunt logs its landing', () => {
    const LANDING_LAG_S = 0.3;
    const LANDING_S = PRESS_S + LANDING_LAG_S;
    const THE_HUNT_WINDOW_S = 30;
    const theHunt = { name: 'The Hunt', spell_id: THE_HUNT, window_s: THE_HUNT_WINDOW_S };
    const log = { buffs: [], abilities: [ability(THE_HUNT, 'The Hunt'), ability(THE_HUNT_LANDING, 'The Hunt')] };
    expect(folded([cast(THE_HUNT, PRESS_S), cast(THE_HUNT_LANDING, LANDING_S)], [theHunt], log)).toEqual([cast(THE_HUNT, PRESS_S)]);
  });

  it('keeps a recast past half the cooldown although the merged duration runs longer', () => {
    const RECAST_S = PRESS_S + ANTI_MAGIC_SHELL_COOLDOWN_S / 2 + 1;
    const casts = [cast(ANTI_MAGIC_SHELL, PRESS_S), cast(ANTI_MAGIC_SHELL, RECAST_S)];
    expect(folded(casts, wclProjections.pressFolds([ANTI_MAGIC_SHELL_BUTTON]))).toEqual(casts);
  });

  describe('Divine Hymn, one press and a cast per channel tick', () => {
    const TICK_S = 1.05;
    const SECOND_TICK_S = PRESS_S + 2 * TICK_S;
    const DIVINE_HYMN_WINDOW_S = 15;
    const hymn = { name: 'Divine Hymn', spell_id: DIVINE_HYMN, window_s: DIVINE_HYMN_WINDOW_S };
    const names = [ability(DIVINE_HYMN, 'Divine Hymn'), ability(DIVINE_HYMN_TICK, 'Divine Hymn')];

    it('counts the press under the button\'s own id when WCL logs its first tick a ms before it', () => {
      const PRESS_LAG_S = 0.001;
      const casts = [cast(DIVINE_HYMN_TICK, PRESS_S), cast(DIVINE_HYMN, PRESS_S + PRESS_LAG_S), cast(DIVINE_HYMN_TICK, PRESS_S + TICK_S)];
      expect(folded(casts, [hymn], { buffs: [], abilities: names })).toEqual([cast(DIVINE_HYMN, PRESS_S)]);
    });

    it('folds a tick that refreshes the stacking aura the channel builds', () => {
      const buffs = [
        applyBuff(DIVINE_HYMN_TICK, PRESS_S), applyBuffStack(DIVINE_HYMN_TICK, PRESS_S + TICK_S, 2),
        applyBuffStack(DIVINE_HYMN_TICK, SECOND_TICK_S, 3), refreshBuff(DIVINE_HYMN_TICK, SECOND_TICK_S),
      ];
      const casts = [cast(DIVINE_HYMN, PRESS_S), cast(DIVINE_HYMN_TICK, PRESS_S + TICK_S), cast(DIVINE_HYMN_TICK, SECOND_TICK_S)];
      expect(folded(casts, [hymn], { buffs, abilities: names })).toEqual([cast(DIVINE_HYMN, PRESS_S)]);
    });
  });

  describe('a repeat inside the window that refreshes the button\'s own aura', () => {
    const DEMON_HUNTER_ID = 7;
    const BLUR_WINDOW_S = 10;
    const SECOND_CHARGE_S = PRESS_S + 9;
    // Mirrors the service's skew, so changing one without the other un-pins the boundary below.
    const CAST_AURA_SKEW_S = 0.05;
    const ONE_MS_S = 0.001;
    const blur = { name: 'Blur', spell_id: BLUR, window_s: BLUR_WINDOW_S };
    const blurs = [cast(BLUR, PRESS_S, { source: DEMON_HUNTER_ID }), cast(BLUR, SECOND_CHARGE_S, { source: DEMON_HUNTER_ID })];
    const refreshedAt = (atS: number): PressLog => ({
      buffs: [applyBuff(BLUR_BUFF, PRESS_S, { target: DEMON_HUNTER_ID }), refreshBuff(BLUR_BUFF, atS, { target: DEMON_HUNTER_ID })],
      abilities: [ability(BLUR, 'Blur'), ability(BLUR_BUFF, 'Blur')],
    });

    it('is kept, as a second charge the spell data leaves out', () => {
      expect(folded(blurs, [blur], refreshedAt(SECOND_CHARGE_S))).toEqual(blurs);
    });

    it('is kept when the refresh lands the skew off the cast, and folded when it lands a ms further', () => {
      expect(folded(blurs, [blur], refreshedAt(SECOND_CHARGE_S + CAST_AURA_SKEW_S))).toHaveLength(2);
      expect(folded(blurs, [blur], refreshedAt(SECOND_CHARGE_S + CAST_AURA_SKEW_S + ONE_MS_S))).toHaveLength(1);
    });
  });

  it('never folds an ability the plan does not name', () => {
    const twice = [cast(SHADOW_BLADES, PRESS_S, { source: PRIEST_ID }), cast(SHADOW_BLADES, PRESS_S, { source: PRIEST_ID })];
    expect(folded(twice)).toEqual(twice);
  });

  it('keeps two different buttons pressed in the same instant', () => {
    const both = [press(PRESS_S), cast(SHADOW_BLADES, PRESS_S, { source: PRIEST_ID })];
    expect(folded(both)).toEqual(both);
  });

  it('passes every event that is not a cast through untouched', () => {
    const buffs = [applyBuff(POWER_INFUSION, PRESS_S, { target: ALLY_ID }), applyBuff(POWER_INFUSION, PRESS_S, { target: PRIEST_ID })];
    expect(folded(buffs)).toEqual(buffs);
  });
});
