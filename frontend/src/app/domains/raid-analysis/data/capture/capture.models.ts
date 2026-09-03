// Boundary shape of the live feature; the recording machinery stays private to LiveCaptureFeatureService.
export interface ClipAnchor {
  timeS: number;
  /** Window length in seconds; 0 for a point-in-time cast, which gets pre/post roll instead. */
  windowLengthS: number;
  /** Stable per-window key, so the same window resolves the same memoized clip. */
  key: string;
}
