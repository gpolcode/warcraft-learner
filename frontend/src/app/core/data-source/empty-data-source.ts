import { DataSource } from './data-source';

/**
 * A `DataSource<T>` that never has a bench: `getBench` always resolves `null`. It
 * models a fresh tier/expansion where no top-parse data has been ingested yet - every
 * slice reads `null` and the cards render their "waiting for top parses" state.
 *
 * Bound in the `empty` environment (`environment.empty.ts`) so the whole app runs
 * against empty encounter data while the rulebooks, spec manifest, and encounter
 * indexes still read through `DataFileApiService` normally. It takes no dependencies,
 * so - like `FileDataSource` - it keeps every `*TransformService` out of the bundle.
 */
export class EmptyDataSource<T> implements DataSource<T> {
  getBench(): Promise<T | null> {
    return Promise.resolve(null);
  }
}
