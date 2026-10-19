import { inject, Injectable } from '@angular/core';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { DataFileApiService } from '../../data-files/data-file-api-service';
import { IngestStateService } from '../../ingest/ingest-state-service';
import { CalibrationIndex, ContrastBench, EncounterCalibration } from './calibration.models';
import { CalibrationIndexService } from './calibration-index-service';
import { RegistryHashService } from './registry-hash-service';
import { CalibrationReportService } from './calibration-report-service';
import { EncounterCalibrationService } from './encounter-calibration-service';
import { BenchName, EncounterBenches } from './held-out-case-service';

/** The bench folder each encounter's calibration file sits in, beside its benches. */
export const CALIBRATION_DIR = 'calibration';
/** The bench folder each encounter's contrast cohort sits in. */
export const CONTRAST_DIR = 'contrast';

const BENCH_NAMES: readonly BenchName[] = ['rotation', 'defensive', 'gear', 'burst'];
const HASH_LENGTH = 16;

export interface CalibrationRun {
  index: CalibrationIndex;
  previous: CalibrationIndex | null;
  breaches: string[];
  report: string;
}

/** Calibrates every benched encounter from the files on disk, at zero WCL cost, and pools the result into the index pages read. */
@Injectable({ providedIn: 'root' })
export class CalibrationRunService {
  private readonly files = inject(DataFileApiService);
  private readonly encounters = inject(EncounterCalibrationService);
  private readonly indices = inject(CalibrationIndexService);
  private readonly hashes = inject(RegistryHashService);
  private readonly reports = inject(CalibrationReportService);
  private readonly ingestState = inject(IngestStateService);

  /** `recompute` ignores the stored per-encounter files, as a check of changed code must; otherwise an unchanged signature reuses its file. */
  async run(recompute: boolean): Promise<CalibrationRun> {
    const stored = await this.files.getCalibrationIndex();
    const previous = stored.ok ? stored.value as CalibrationIndex : null;
    const calibrated: EncounterCalibration[] = [];
    for (const spec of await this.files.listSpecs()) {
      for (const encounterId of await this.encounterIds(spec)) {
        calibrated.push(await this.encounter(spec, encounterId, recompute));
      }
    }
    const index = this.indices.build(calibrated);
    await this.files.writeCalibrationIndex(index);
    return { index, previous, breaches: this.indices.breaches(previous, index), report: this.reports.report(index) };
  }

  /** Removes the calibration and contrast files of an encounter the ingest pruned. */
  async remove(spec: string, encounterId: number): Promise<void> {
    await this.files.removeBench(spec, encounterId, CALIBRATION_DIR);
    await this.files.removeBench(spec, encounterId, CONTRAST_DIR);
  }

  private async encounter(spec: string, encounterId: number, recompute: boolean): Promise<EncounterCalibration> {
    const benches = await this.benches(spec, encounterId);
    const contrast = await this.files.getBench<ContrastBench>(spec, encounterId, CONTRAST_DIR);
    const cohort = contrast.ok ? contrast.value : null;
    const signature = this.signature(benches, cohort);
    if (!recompute) {
      const stored = await this.files.getBench<EncounterCalibration>(spec, encounterId, CALIBRATION_DIR);
      if (stored.ok && stored.value.signature === signature) return stored.value;
    }
    const calibration = this.encounters.calibrate(spec, encounterId, benches, signature, cohort);
    await this.files.writeBench(spec, encounterId, CALIBRATION_DIR, calibration);
    return calibration;
  }

  private async encounterIds(spec: string): Promise<number[]> {
    const lists = await Promise.all(BENCH_NAMES.map(name => this.files.listBenchFiles(spec, name)));
    return [...new Set(lists.flatMap(files => this.ingestState.encounterIdsFromFiles(files)))].sort((a, b) => a - b);
  }

  private async benches(spec: string, encounterId: number): Promise<EncounterBenches> {
    const read = async <K extends BenchName>(name: K): Promise<EncounterBenches[K]> => {
      const bench = await this.files.getBench<NonNullable<EncounterBenches[K]>>(spec, encounterId, name);
      return bench.ok ? bench.value : null;
    };
    return { rotation: await read('rotation'), defensive: await read('defensive'), gear: await read('gear'), burst: await read('burst') };
  }

  /** The benches' own stamps, the contrast cohort's and the registry hash: new top logs, a new cohort or a changed rule re-run calibration, nothing else does. */
  private signature(benches: EncounterBenches, contrast: ContrastBench | null): string {
    const stamps = BENCH_NAMES.map(name => {
      const bench = benches[name] as { source_signature?: string; ingest_version?: number } | null;
      return `${name}:${bench?.source_signature ?? ''}:${bench?.ingest_version ?? ''}`;
    });
    const cohort = `contrast:${contrast?.signature ?? ''}:${contrast?.fetched_at_s ?? ''}`;
    return bytesToHex(sha256(utf8ToBytes([this.hashes.registryHash(), ...stamps, cohort].join('\n')))).slice(0, HASH_LENGTH);
  }
}
