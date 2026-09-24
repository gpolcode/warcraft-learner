import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Result, Results } from '../../../shared/util-http/result';
import { WclApiService } from '../wcl/wcl-api-service';
import { SimcDataService } from '../http/simc-data-service';
import { SpecPlanLoaderService } from './spec-plan-loader-service';

const DEATH_KNIGHT = { name: 'Death Knight', slug: 'DeathKnight', specs: [{ name: 'Unholy', slug: 'Unholy' }, { name: 'Frost', slug: 'Frost' }] };
const DUMP = [
  'Name             : Dark Transformation (id=63560) [Spell Family (15)] ',
  'Cooldown         : 45 seconds',
  'Labels           : 690: Major Cooldowns',
].join('\n');
const PROFILE = 'actions=dark_transformation';
const UNREACHABLE = Results.transient('WCL is unreachable right now.');

/** Records every SimC read and answers each from the queue given for it, repeating the last answer. */
function simcFake(answers: { profile?: Result<string>[]; dump?: Result<string>[] } = {}) {
  const reads: string[] = [];
  const next = (queue: Result<string>[] | undefined, fallback: Result<string>) => (queue && queue.length > 1 ? queue.shift() : queue?.[0]) ?? fallback;
  const fake = {
    reads,
    getProfile: async (classLabel: string, specLabel: string) => {
      reads.push(`profile ${classLabel} ${specLabel}`);
      return next(answers.profile, Results.ok(PROFILE));
    },
    getSpellDump: async (className: string) => {
      reads.push(`dump ${className}`);
      return next(answers.dump, Results.ok(DUMP));
    },
  };
  return fake;
}

function loader(simc: ReturnType<typeof simcFake>): SpecPlanLoaderService {
  TestBed.configureTestingModule({ providers: [
    { provide: SimcDataService, useValue: simc },
    { provide: WclApiService, useValue: { getPlayableClasses: async () => [DEATH_KNIGHT] } },
  ] });
  return TestBed.inject(SpecPlanLoaderService);
}

describe('SpecPlanLoaderService.planFor', () => {
  it('builds a spec\'s plan from the profile under its WCL labels and its class\'s dump', async () => {
    const simc = simcFake();
    const plan = await loader(simc).planFor('UnholyDeathKnight');
    expect(simc.reads).toEqual(['profile Death Knight Unholy', 'dump DeathKnight']);
    expect(plan.ok && plan.value.cooldowns.map(cooldown => cooldown.name)).toEqual(['Dark Transformation']);
  });

  it('plans a spec SimC ships no profile for from the dump\'s labels alone', async () => {
    const plan = await loader(simcFake({ profile: [Results.missing('Not yet ingested.')] })).planFor('UnholyDeathKnight');
    expect(plan.ok && plan.value.rules).toEqual([]);
    expect(plan.ok && plan.value.cooldowns).toHaveLength(1);
  });

  it('keeps each plan and each class dump for the session', async () => {
    const simc = simcFake();
    const plans = loader(simc);
    await plans.planFor('UnholyDeathKnight');
    await plans.planFor('UnholyDeathKnight');
    await plans.planFor('FrostDeathKnight');
    expect(simc.reads).toEqual(['profile Death Knight Unholy', 'dump DeathKnight', 'profile Death Knight Frost']);
  });

  it('reads the sources again after a failed read rather than keeping the failure', async () => {
    const simc = simcFake({ dump: [UNREACHABLE, Results.ok(DUMP)] });
    const plans = loader(simc);
    expect(await plans.planFor('UnholyDeathKnight')).toEqual(UNREACHABLE);
    expect((await plans.planFor('UnholyDeathKnight')).ok).toBe(true);
  });

  it('fails a profile read that is more than missing', async () => {
    expect(await loader(simcFake({ profile: [UNREACHABLE] })).planFor('UnholyDeathKnight')).toEqual(UNREACHABLE);
  });

  it('reads a spec WCL does not list as missing', async () => {
    expect(await loader(simcFake()).planFor('DevourerDemonHunter')).toEqual(Results.missing('No spec metadata for DevourerDemonHunter.'));
  });
});
