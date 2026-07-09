/**
 * The manual data-freshness knob folded into every encounter signature (see signature.ts).
 * Bump it as part of any change that should produce different tailored data (transform
 * math, rulebook semantics, a deliberate refresh): the bump changes every skip key, so the
 * next ingest runs re-derive every file, oldest-version specs first.
 */
export const INGEST_VERSION = 6;
