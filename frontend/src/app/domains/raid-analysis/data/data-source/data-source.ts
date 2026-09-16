import { Result } from '../../../shared/util-http/result';
import { TopParseSelection } from '../wcl/wcl.models';
import type { Rulebook } from '../rulebook/rulebook.models';

export interface DataSource<T> {
  /** `selection` is ingest-only: the orchestrator resolves it once per encounter, so every bench covers the parse set the signature was taken over. */
  getBench(spec: string, encounterId: number, selection?: TopParseSelection): Promise<Result<T>>;
}

/** A transform whose recipe reads the encounter's rulebook, called this way only by the two roots that hold one: the ingest orchestrator and the live data source. */
export interface RulebookDataSource<T> {
  getBench(spec: string, encounterId: number, selection: TopParseSelection | undefined, rulebook: Rulebook | null): Promise<Result<T>>;
}
