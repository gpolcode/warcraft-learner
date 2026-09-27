import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Result, Results } from '../../../shared/util-http/result';
import { WclApiService } from '../wcl/wcl-api-service';
import { SimcDataService } from '../http/simc-data-service';
import { TalentDataService, TalentTree } from '../http/talent-data-service';
import { SpecPlanLoaderService } from './spec-plan-loader-service';

const DEATH_KNIGHT = { name: 'Death Knight', slug: 'DeathKnight', specs: [{ name: 'Unholy', slug: 'Unholy' }, { name: 'Frost', slug: 'Frost' }] };
const DUMP = [
  'Name             : Dark Transformation (id=63560) [Spell Family (15)] ',
  'Cooldown         : 45 seconds',
  'Labels           : 690: Major Cooldowns',
].join('\n');
const APL = 'actions=dark_transformation,if=talent.unholy_assault&buff.dark_empowerment.up';
const SOURCES = ['class_modules/sc_death_knight.cpp', 'player/player.cpp'];
const CODE = 'buff.dark_empowerment = make_buff( this, "dark_empowerment", find_spell( 63560 ) );';
const UNHOLY_ASSAULT_ENTRY = 96304;
const TREE: TalentTree = { talents: [{ id: UNHOLY_ASSAULT_ENTRY, name: 'Unholy Assault' }], heroTrees: [], apex: [] };
const UNREACHABLE = Results.transient('WCL is unreachable right now.');

const next = <T>(queue: Result<T>[] | undefined, fallback: Result<T>): Result<T> => (queue && queue.length > 1 ? queue.shift() : queue?.[0]) ?? fallback;

/** Records every SimC and Raidbots read and answers each from the queue given for it, repeating the last answer. */
function simcFake(answers: { apl?: Result<string>[]; dump?: Result<string>[]; trees?: Result<Map<string, TalentTree>>[]; source?: Result<string>[] } = {}) {
  const reads: string[] = [];
  const fake = {
    reads,
    getApl: async (className: string, specLabel: string) => {
      reads.push(`apl ${className} ${specLabel}`);
      return next(answers.apl, Results.ok(APL));
    },
    getSpellDump: async (className: string) => {
      reads.push(`dump ${className}`);
      return next(answers.dump, Results.ok(DUMP));
    },
    getTalentTrees: async () => {
      reads.push('talents');
      return next(answers.trees, Results.ok(new Map([['UnholyDeathKnight', TREE]])));
    },
    sourcePaths: () => SOURCES,
    getSource: async (path: string) => {
      reads.push(`source ${path}`);
      return next(answers.source, Results.ok(CODE));
    },
  };
  return fake;
}

function loader(simc: ReturnType<typeof simcFake>): SpecPlanLoaderService {
  TestBed.configureTestingModule({ providers: [
    { provide: SimcDataService, useValue: simc },
    { provide: TalentDataService, useValue: simc },
    { provide: WclApiService, useValue: { getPlayableClasses: async () => [DEATH_KNIGHT] } },
  ] });
  return TestBed.inject(SpecPlanLoaderService);
}

describe('SpecPlanLoaderService.planFor', () => {
  it('builds a spec\'s plan from the list under its WCL class slug and spec label, its class\'s dump and its talent tree', async () => {
    const simc = simcFake();
    const plan = await loader(simc).planFor('UnholyDeathKnight');
    expect(simc.reads).toEqual(['apl DeathKnight Unholy', 'dump DeathKnight', 'talents', ...SOURCES.map(path => `source ${path}`)]);
    expect(plan.ok && plan.value.cooldowns.map(cooldown => cooldown.name)).toEqual(['Dark Transformation']);
    expect(plan.ok && plan.value.talents['talent.unholy_assault']?.entries).toEqual([UNHOLY_ASSAULT_ENTRY]);
  });

  it('plans a spec SimC writes no list for from the dump\'s labels alone', async () => {
    const plan = await loader(simcFake({ apl: [Results.missing('Not yet ingested.')] })).planFor('UnholyDeathKnight');
    expect(plan.ok && plan.value.lines).toEqual([]);
    expect(plan.ok && plan.value.cooldowns).toHaveLength(1);
  });

  it('keeps each plan, each class dump, each source file and the talent file for the session', async () => {
    const simc = simcFake();
    const plans = loader(simc);
    await plans.planFor('UnholyDeathKnight');
    await plans.planFor('UnholyDeathKnight');
    await plans.planFor('FrostDeathKnight');
    expect(simc.reads).toEqual(['apl DeathKnight Unholy', 'dump DeathKnight', 'talents', ...SOURCES.map(path => `source ${path}`), 'apl DeathKnight Frost']);
  });

  it('reads a name the dump does not hold through the class\'s SimC code', async () => {
    const plan = await loader(simcFake()).planFor('UnholyDeathKnight');
    expect(plan.ok && plan.value.spells['dark_empowerment']?.ids).toEqual([63560]);
  });

  it('builds the plan without a source that fails to load, leaving only the names it declares unread', async () => {
    const plan = await loader(simcFake({ source: [UNREACHABLE] })).planFor('UnholyDeathKnight');
    expect(plan.ok && plan.value.cooldowns).toHaveLength(1);
    expect(plan.ok && plan.value.spells['dark_empowerment']).toBeUndefined();
  });

  it('reads a talent the file does not name for the spec as unknown rather than failing the plan', async () => {
    const plan = await loader(simcFake()).planFor('FrostDeathKnight');
    expect(plan.ok && plan.value.talents).toEqual({});
  });

  it('reads the talent file again after a failed read', async () => {
    const simc = simcFake({ trees: [UNREACHABLE, Results.ok(new Map())] });
    const plans = loader(simc);
    expect(await plans.planFor('UnholyDeathKnight')).toEqual(UNREACHABLE);
    expect((await plans.planFor('UnholyDeathKnight')).ok).toBe(true);
  });

  it('reads the sources again after a failed read rather than keeping the failure', async () => {
    const simc = simcFake({ dump: [UNREACHABLE, Results.ok(DUMP)] });
    const plans = loader(simc);
    expect(await plans.planFor('UnholyDeathKnight')).toEqual(UNREACHABLE);
    expect((await plans.planFor('UnholyDeathKnight')).ok).toBe(true);
  });

  it('fails a list read that is more than missing', async () => {
    expect(await loader(simcFake({ apl: [UNREACHABLE] })).planFor('UnholyDeathKnight')).toEqual(UNREACHABLE);
  });

  it('reads a spec WCL does not list as missing', async () => {
    expect(await loader(simcFake()).planFor('DevourerDemonHunter')).toEqual(Results.missing('No spec metadata for DevourerDemonHunter.'));
  });
});
