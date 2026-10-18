import { inject, Injectable } from '@angular/core';
import { FamilyCaps } from '../tone.models';
import { CalibrationIndex } from './calibration.models';
import { CalibrationIndexService } from './calibration-index-service';
import { CALIBRATION_SOURCE } from './calibration-source';

/** What a page hands every producer, so each tone it makes is capped by calibration. */
@Injectable({ providedIn: 'root' })
export class CalibrationCapsService {
  private readonly source = inject(CALIBRATION_SOURCE);
  private readonly indices = inject(CalibrationIndexService);

  /** A missing, unreadable or foreign index fails closed: every family is a comparison. */
  async load(spec: string, encounterId: number): Promise<FamilyCaps> {
    const loaded = await this.source.load();
    const index = loaded.ok && this.isIndex(loaded.value) ? loaded.value : null;
    return { capOf: familyId => this.indices.capOf(index, { spec, encounterId }, familyId) };
  }

  private isIndex(value: unknown): value is CalibrationIndex {
    const index = value as Partial<CalibrationIndex> | null;
    return typeof index?.registry_hash === 'string' && typeof index.specs === 'object' && typeof index.demoted === 'object';
  }
}
