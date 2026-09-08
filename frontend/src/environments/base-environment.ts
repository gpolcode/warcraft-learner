export interface Environment {
  dataBaseHref: string;
}

/** An empty `dataBaseHref` resolves `data/specs/` relative to `document.baseURI`. */
export function withEnvironment(deltas: Partial<Environment>): Environment {
  return {
    dataBaseHref: '',
    ...deltas,
  };
}
