import { inject, Injectable } from '@angular/core';
import { FamilyCaps, ToneLevel } from '../tone.models';
import { CalibrationIndex, FamilyVerdict } from './calibration.models';
import { CALIBRATION_SOURCE } from './calibration-source';
import { RegistryHashService } from './registry-hash-service';

export const COMPARISON: FamilyVerdict = { status: 'comparison', cap: 'neutral', reason: 'Not graded: no calibration matches this version of the checks.' };

/** What a page hands every producer, so each tone it makes is capped by calibration. */
@Injectable({ providedIn: 'root' })
export class CalibrationCapsService {
  private readonly source = inject(CALIBRATION_SOURCE);
  private readonly hashes = inject(RegistryHashService);

  /** A missing, unreadable or foreign index fails closed: every family is a comparison. */
  async load(spec: string, encounterId: number): Promise<FamilyCaps> {
    const loaded = await this.source.load();
    const index = loaded.ok && this.isIndex(loaded.value) ? loaded.value : null;
    return { capOf: familyId => this.capOf(index, { spec, encounterId }, familyId) };
  }

  /** The spec's verdict, lowered to comparison on a bench its own rate demotes, and on an index for another registry. */
  capOf(index: CalibrationIndex | null, page: { spec: string; encounterId: number }, familyId: string): ToneLevel {
    if (index?.registry_hash !== this.hashes.registryHash()) return COMPARISON.cap;
    if (index.demoted[page.spec]?.[String(page.encounterId)]?.includes(familyId)) return COMPARISON.cap;
    return (index.specs[page.spec]?.[familyId] ?? COMPARISON).cap;
  }

  private isIndex(value: unknown): value is CalibrationIndex {
    const index = value as Partial<CalibrationIndex> | null;
    return typeof index?.registry_hash === 'string' && typeof index.specs === 'object' && typeof index.demoted === 'object';
  }
}
