/**
 * The manual freshness knob folded into every encounter signature. Bump it as part of
 * any change that should produce different tailored data (transform math, rulebook
 * semantics, a deliberate refresh): every skip key changes, so the next runs re-derive
 * every file.
 */
export const INGEST_VERSION = 6;
