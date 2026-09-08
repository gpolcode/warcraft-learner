export interface SpecMeta {
  spec: string;
  /** No-space class form, e.g. 'DeathKnight' (WCL className for the rankings query). */
  className: string;
  /** No-space spec form, e.g. 'BeastMastery' (WCL specName for the rankings query). */
  specName: string;
  classLabel: string;
  specLabel: string;
  classIcon: string;
  specIcon: string;
}
