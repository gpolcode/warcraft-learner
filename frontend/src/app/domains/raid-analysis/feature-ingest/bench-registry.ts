import { Injectable, inject } from '@angular/core';
import { DataFileApiService } from '../data/data-files/data-file-api-service';
import { type Result } from '../../shared/util-http/result';
import type { TopParseSelection } from '../data/wcl/wcl.models';
import { BurstTransformService } from '../data/burst-windows/burst-transform-service';
import { RotationTransformService } from '../data/rotation/rotation-transform-service';
import { DefensiveTransformService } from '../data/defensive/defensive-transform-service';
import { GearTransformService } from '../data/gear/gear-transform-service';
import { MapTransformService } from '../data/map/map-transform-service';
import { NorthernSkyTransformService } from '../data/northern-sky/northern-sky-transform-service';

export interface BenchDescriptor {
  readonly file: string;
  readonly transform: { getBench(spec: string, encId: number, selection: TopParseSelection): Promise<Result<object>> };
  readonly write: (spec: string, encId: number, data: object) => Promise<void>;
}

/** Non-empty: the orchestrator destructures the head as the burst bench. */
type BenchRegistry = readonly [BenchDescriptor, ...BenchDescriptor[]];

export const LEAD_BENCH = 'burst';

@Injectable({ providedIn: 'root' })
export class BenchRegistryService {
  private readonly dataFile = inject(DataFileApiService);

  private bench(file: string, transform: BenchDescriptor['transform']): BenchDescriptor {
    return {
      file, transform,
      write: (spec, encId, data) => this.dataFile.writeBench(spec, encId, file, data),
    };
  }

  // Burst leads: only its file carries the encounter signature, stamped only when every bench behind it produced data.
  readonly benches: BenchRegistry = [
    this.bench(LEAD_BENCH, inject(BurstTransformService)),
    this.bench('rotation', inject(RotationTransformService)),
    this.bench('defensive', inject(DefensiveTransformService)),
    this.bench('gear', inject(GearTransformService)),
    this.bench('positions', inject(MapTransformService)),
    this.bench('northern-sky', inject(NorthernSkyTransformService)),
  ];
}
