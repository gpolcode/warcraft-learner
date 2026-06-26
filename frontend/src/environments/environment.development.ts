/**
 * Development environment (swapped in by the `development` build configuration).
 *
 * `useLiveTransform: true` would bind every `*_DATA_SOURCE` token to its
 * `*TransformService`, computing each slice's prepared data live from WCL in the
 * browser so the app runs with zero ingested files.
 *
 * It is currently `false` (same as prod) because the first slice's live transform
 * (`BurstTransformService`) is not implemented yet - porting the ingest top-parse
 * extract to the browser is a follow-up. Keeping it on the file source means
 * `npm start` works against ingested data. Flip to `true` once the live transforms
 * land. The swap infrastructure (token + provideDataSource) is already in place.
 */
export const environment = {
  useLiveTransform: false,
};
