import { inject, Injectable } from '@angular/core';
import { FamilyCaps, ToneLevel } from '../tone.models';
import { FindingFamily } from '../finding-family.models';
import { CalibrationIndex, FamilyVerdict, NotGradedNote } from './calibration.models';
import { NOT_GRADED } from './arming-service';
import { CALIBRATION_SOURCE } from './calibration-source';
import { RegistryHashService } from './registry-hash-service';

export const COMPARISON: FamilyVerdict = { status: 'comparison', cap: 'neutral', reason: 'No measurement of how often it flags top raiders matches this version of the check.' };

/** The caps a page hands every producer, plus each family's verdict for the card's not-graded list. */
export interface CalibrationCaps extends FamilyCaps {
  verdictOf(familyId: string): FamilyVerdict;
}

const DEMOTED_HERE: FamilyVerdict = { status: 'comparison', cap: 'neutral', reason: NOT_GRADED.bench };

/** What a page hands every producer, so each tone it makes is capped by calibration. */
@Injectable({ providedIn: 'root' })
export class CalibrationCapsService {
  private readonly source = inject(CALIBRATION_SOURCE);
  private readonly hashes = inject(RegistryHashService);

  /** A missing, unreadable or foreign index fails closed: every family is a comparison. */
  async load(spec: string, encounterId: number): Promise<CalibrationCaps> {
    const loaded = await this.source.load();
    const index = loaded.ok && this.isIndex(loaded.value) ? loaded.value : null;
    const page = { spec, encounterId };
    return {
      capOf: familyId => this.capOf(index, page, familyId),
      verdictOf: familyId => this.verdictOf(index, page, familyId),
    };
  }

  capOf(index: CalibrationIndex | null, page: { spec: string; encounterId: number }, familyId: string): ToneLevel {
    return this.verdictOf(index, page, familyId).cap;
  }

  /** The spec's verdict, lowered to comparison on a bench its own rate demotes, and on an index for another registry. */
  verdictOf(index: CalibrationIndex | null, page: { spec: string; encounterId: number }, familyId: string): FamilyVerdict {
    if (index?.registry_hash !== this.hashes.registryHash()) return COMPARISON;
    if (index.demoted[page.spec]?.[String(page.encounterId)]?.includes(familyId)) return DEMOTED_HERE;
    return index.specs[page.spec]?.[familyId] ?? COMPARISON;
  }

  /** The card's families calibration leaves ungraded, each with why, in the card's order. */
  notGraded(caps: CalibrationCaps, families: readonly FindingFamily[]): NotGradedNote[] {
    return families.flatMap(family => {
      const verdict = caps.verdictOf(family.id);
      return verdict.status === 'graded' ? [] : [{ label: family.label, reason: verdict.reason }];
    });
  }

  private isIndex(value: unknown): value is CalibrationIndex {
    const index = value as Partial<CalibrationIndex> | null;
    return typeof index?.registry_hash === 'string' && typeof index.specs === 'object' && typeof index.demoted === 'object';
  }
}
