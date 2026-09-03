import { DataFileApiService } from '../data-files/data-file-api-service';
import { DataSource } from './data-source';
import { Result } from '../../../shared/util-http/result';

// provideDataSource instantiates one per *_DATA_SOURCE token, so it is not providedIn root.
export class FileDataSource<T> implements DataSource<T> {
  constructor(private readonly files: DataFileApiService, private readonly bench: string) {}

  getBench(spec: string, encounterId: number): Promise<Result<T>> {
    return this.files.getBench<T>(spec, encounterId, this.bench);
  }
}
