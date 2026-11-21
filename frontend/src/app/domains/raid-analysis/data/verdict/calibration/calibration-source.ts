import { inject, InjectionToken } from '@angular/core';
import { DataFileApiService } from '../../data-files/data-file-api-service';
import { Result } from '../../../../shared/util-http/result';
import { CalibrationIndex } from './calibration.models';

/** Where a page reads the pooled calibration from; a spec swaps it for a fixed index. */
export interface CalibrationSource {
  load(): Promise<Result<CalibrationIndex | null>>;
}

export const CALIBRATION_SOURCE = new InjectionToken<CalibrationSource>('CALIBRATION_SOURCE', {
  providedIn: 'root',
  factory: () => {
    const files = inject(DataFileApiService);
    return { load: () => files.getCalibrationIndex() as Promise<Result<CalibrationIndex | null>> };
  },
});
