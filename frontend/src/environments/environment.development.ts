/**
 * Development environment (swapped in by the `development` build configuration).
 *
 * `useLiveTransform: true` binds every `*_DATA_SOURCE` token to its
 * `*TransformService`, so each slice computes its prepared data live from WCL in
 * the browser - the app runs with zero ingested data files. Slower, dev only.
 */
export const environment = {
  useLiveTransform: true,
};
