import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Results } from '../../../shared/util-http/result';
import { tone } from '../../../../../testing/builders/tone';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { FixFirstFeatureService } from './fix-first-feature-service';
import { CALIBRATION_SOURCE } from '../verdict/calibration/calibration-source';
import { CalibrationIndex } from '../verdict/calibration/calibration.models';
import { RegistryHashService } from '../verdict/calibration/registry-hash-service';
import { BURST_DATA_SOURCE } from '../burst-windows/burst-data-source';
import { PullContextService } from '../analysis/pull-context-service';
import { WclApiService } from '../wcl/wcl-api-service';
import { PullModel } from '../analysis/pull-model-service';
import { CLOSED_GATE, DamageGate } from '../verdict/damage-estimate-service';
import { CardRanking, RankedRow } from '../verdict/row-order-service';

const SPEC = 'AssassinationRogue';
const HEALER = 'HolyPaladin';
const ENCOUNTER_ID = 3470;
const PULL = { reportCode: 'r', fightId: 1, playerId: 2 };
const OPEN: DamageGate = { logs: 40, exceedShare: 0.05, spearman: 0.5, open: true };
const NO_FOLDS = { dead: 0, after_wipe: 0, not_reached: 0 };
/** Dead from 1:00 to 1:30, then from 4:00 to the kill at 5:00. */
const DIED_S = 60;
const BACK_S = 90;
const SECOND_DEATH_S = 240;
const FIGHT_S = 300;

const hash = TestBed.inject(RegistryHashService).registryHash();
const priced = (aboutS: number) => ({ aboutS, lowS: aboutS, highS: aboutS });

function ranked(over: Partial<RankedRow>): RankedRow {
  return {
    card: 'Offensives', check: 'Unused ready time', subject: 'Shadow Blades', tone: tone('amber'),
    rank: { costClass: 'high', evidence: 'red', shortfall: 0 }, damage: null, message: 'Message.', ...over,
  };
}

const card = (rows: RankedRow[], folded = NO_FOLDS): CardRanking => ({ rows, folded });

function service(over: { index?: Partial<CalibrationIndex> | null; model?: PullModel } = {}): FixFirstFeatureService {
  TestBed.resetTestingModule();
  const index = over.index === null ? null : { registry_hash: hash, damage: OPEN, ...over.index };
  const model = over.model ?? pullModel();
  TestBed.configureTestingModule({
    providers: [
      { provide: CALIBRATION_SOURCE, useValue: { load: () => Promise.resolve(Results.ok(index)) } },
      // The faked pull context reads nothing from WCL.
      { provide: WclApiService, useValue: {} },
      { provide: BURST_DATA_SOURCE, useValue: { getBench: () => Promise.resolve(Results.missing('no bench')) } },
      { provide: PullContextService, useValue: { analyzePull: async (_api: unknown, _pull: unknown, analysis: { analyze: (context: { model: PullModel }) => Promise<unknown> }) => Results.ok(await analysis.analyze({ model })) } },
    ],
  });
  return TestBed.inject(FixFirstFeatureService);
}

describe('FixFirstFeatureService.view', () => {
  it('lists the costliest colored rows across every card', () => {
    const offensives = card([ranked({ subject: 'Shadow Blades' })]);
    const gear = card([ranked({ card: 'Gear', subject: 'Legs', tone: tone('amber'), rank: { costClass: 'low', evidence: 'red', shortfall: 0 } })]);

    expect(service().view([gear, offensives], OPEN).rows.map(row => row.subject)).toEqual(['Shadow Blades', 'Legs']);
  });

  it('says nothing is flagged, with the checks not judged, when no row is colored', () => {
    const muted = card([ranked({ tone: tone('neutral') })], { dead: 2, after_wipe: 1, not_reached: 0 });

    expect(service().view([muted], CLOSED_GATE)).toMatchObject({ rows: [], notJudged: 3, empty: 'Nothing flagged on any card. 3 checks not judged.' });
  });

  it('says only that nothing is flagged when every check was judged', () => {
    expect(service().view([], CLOSED_GATE).empty).toBe('Nothing flagged on any card.');
  });

  it('prints estimates only once the gate is open', () => {
    expect(service().view([], OPEN).damageShown).toBe(true);
    expect(service().view([], CLOSED_GATE).damageShown).toBe(false);
  });
});

describe('FixFirstFeatureService.damageView', () => {
  const death = (diedS: number, aboutS: number) => ({ diedS, backS: null, damage: priced(aboutS) });

  it('draws nothing while the gate is closed', () => {
    expect(service().damageView([card([ranked({ damage: priced(6) })])], [death(DIED_S, 30)], CLOSED_GATE)).toBeNull();
  });

  it('draws nothing with no death and no priced row', () => {
    expect(service().damageView([card([ranked({})])], [], OPEN)).toBeNull();
  });

  it('ranks deaths first, largest first, and folds the checks the deaths silenced under them once', () => {
    const view = service().damageView([card([ranked({ damage: priced(6) })], { ...NO_FOLDS, dead: 4 })], [death(DIED_S, 10), death(SECOND_DEATH_S, 30)], OPEN);

    expect(view?.deaths.map(entry => entry.diedS)).toEqual([SECOND_DEATH_S, DIED_S]);
    expect(view?.foldedUnderDeaths).toBe(4);
    expect(view?.rows.map(row => row.damage?.aboutS)).toEqual([6]);
  });

  it('lists priced rows whatever their tone, largest first', () => {
    const rows = [ranked({ tone: tone('neutral'), damage: priced(3) }), ranked({ damage: priced(8) })];

    expect(service().damageView([card(rows)], [], OPEN)?.rows.map(row => row.damage?.aboutS)).toEqual([8, 3]);
  });
});

describe('FixFirstFeatureService.loadGate', () => {
  it('reads the gate the index measured', async () => {
    expect(await service().loadGate(SPEC)).toEqual(Results.ok(OPEN));
  });

  it('keeps the gate closed on an index for other checks', async () => {
    expect(await service({ index: { registry_hash: 'other' } }).loadGate(SPEC)).toEqual(Results.ok(CLOSED_GATE));
  });

  it('keeps the gate closed without an index', async () => {
    expect(await service({ index: null }).loadGate(SPEC)).toEqual(Results.ok(CLOSED_GATE));
  });

  it('keeps the gate closed for a healer, whose top logs are not ranked on damage', async () => {
    expect(await service().loadGate(HEALER)).toEqual(Results.ok(CLOSED_GATE));
  });
});

describe('FixFirstFeatureService.loadPricing', () => {
  it('prices each death before the judged end, reading its length without the burst bench', async () => {
    const model = pullModel({ fightDurationS: FIGHT_S, deadSpans: [[DIED_S, BACK_S], [SECOND_DEATH_S, FIGHT_S]] });

    expect(await service({ model }).loadPricing(SPEC, ENCOUNTER_ID, PULL)).toEqual(Results.ok({
      gate: OPEN,
      deaths: [
        { diedS: DIED_S, backS: BACK_S, damage: priced(BACK_S - DIED_S) },
        { diedS: SECOND_DEATH_S, backS: null, damage: priced(FIGHT_S - SECOND_DEATH_S) },
      ],
    }));
  });

  it('reads no death while the gate is closed', async () => {
    const model = pullModel({ deadSpans: [[DIED_S, BACK_S]] });

    expect(await service({ model, index: { damage: CLOSED_GATE } }).loadPricing(SPEC, ENCOUNTER_ID, PULL)).toEqual(Results.ok({ gate: CLOSED_GATE, deaths: [] }));
  });
});
