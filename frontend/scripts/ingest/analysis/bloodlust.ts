/**
 * Bloodlust / Heroism / Time Warp (and equivalents) spell ids. Any of these
 * starting a cast opens a "BL window" used by cooldown alignment analysis.
 *
 * Self-contained on the ingest side (the frontend slices reimplement their own
 * copy under the vertical-slice self-containment rule).
 */
export const BLOODLUST_IDS = new Set([2825, 32182, 80353, 90355, 264667, 390386]);

/** Bloodlust lasts 40s; the BL window adds grace on either side. */
export const BLOODLUST_DURATION_S = 40;
