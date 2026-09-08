import { Result } from '../../../shared/util-http/result';
import { TopParseSelection } from '../wcl/wcl.models';

export interface DataSource<T> {
  /** `selection` is ingest-only: the orchestrator resolves it once per encounter, so every bench covers the parse set the signature was taken over. */
  getBench(spec: string, encounterId: number, selection?: TopParseSelection): Promise<Result<T>>;
}
