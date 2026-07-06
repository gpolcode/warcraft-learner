import { DataSource } from './data-source';
import { Result, LoadError, err, missing } from '../result';

/**
 * A `DataSource<T>` whose `getBench` always resolves `err(missing)` - a fresh, un-ingested
 * tier, which the cards render as the bench-empty waiting state. Bound by the `empty`
 * environment; takes no dependencies, so it keeps the transforms tree-shaken out like
 * `FileDataSource`.
 */
export class EmptyDataSource<T> implements DataSource<T> {
  getBench(): Promise<Result<T, LoadError>> {
    return Promise.resolve(err(missing('Not yet ingested.')));
  }
}
