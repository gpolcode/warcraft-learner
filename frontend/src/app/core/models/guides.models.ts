/**
 * The subset of a scraped guide record the app reads from `{spec}/guides.json` (the file
 * the `npm run scrape` pipeline writes). The credits slice reads these to credit the
 * guides a rulebook was built from; the full record has more fields (id, spec, content)
 * the runtime does not need.
 */
export interface GuideRef {
  url: string;
  /** 'web' | 'youtube' | 'simc'. */
  guide_type: string;
  /** Scrape outcome; only 'scraped' guides actually fed the rulebook. */
  status: string;
}
