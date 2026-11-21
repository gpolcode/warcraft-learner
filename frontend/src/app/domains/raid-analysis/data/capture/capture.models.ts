export interface ClipAnchor {
  timeS: number;
  /** Window length in seconds; 0 for a point-in-time cast. */
  windowLengthS: number;
  /** Stable per-window key, so the same window resolves the same memoized clip. */
  key: string;
}
