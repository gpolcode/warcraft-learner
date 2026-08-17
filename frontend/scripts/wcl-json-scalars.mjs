// WCL types every payload field as one shared `JSON` scalar, and a single codegen `scalars` entry can only map that to one TypeScript type.

/** Field coordinate -> the scalar it carries in the committed SDL; codegen.yml maps each one to the app model that reads it. */
export const JSON_FIELD_SCALARS = {
  'Report.playerDetails': 'PlayerDetailsJson',
  'Report.table': 'TableJson',
  'Encounter.characterRankings': 'RankingsJson',
  'ReportEventPaginator.data': 'EventDataJson',
};

const JSON_SCALAR = 'JSON';

function namedTypeRef(typeRef) {
  let ref = typeRef;
  while (ref.ofType) ref = ref.ofType;
  return ref;
}

function findField(types, typeName, fieldName) {
  const type = types.find(entry => entry.name === typeName);
  if (!type) throw new Error(`${typeName} is not in the WCL schema; update JSON_FIELD_SCALARS.`);
  const field = (type.fields ?? []).find(entry => entry.name === fieldName);
  if (!field) throw new Error(`${typeName}.${fieldName} is not in the WCL schema; update JSON_FIELD_SCALARS.`);
  return field;
}

/** Retypes every field in {@link JSON_FIELD_SCALARS} from `JSON` to its own scalar and declares those scalars - a pure function of the introspection payload, so schema:pull stays reproducible. */
export function nameJsonFieldScalars(introspection) {
  const types = introspection.__schema.types;
  const jsonScalar = types.find(entry => entry.kind === 'SCALAR' && entry.name === JSON_SCALAR);
  if (!jsonScalar) throw new Error(`The WCL schema declares no ${JSON_SCALAR} scalar; update JSON_FIELD_SCALARS.`);

  for (const [coordinate, scalarName] of Object.entries(JSON_FIELD_SCALARS)) {
    const [typeName, fieldName] = coordinate.split('.');
    const named = namedTypeRef(findField(types, typeName, fieldName).type);
    if (named.name !== JSON_SCALAR) {
      throw new Error(`${coordinate} is ${named.name}, not ${JSON_SCALAR}; update JSON_FIELD_SCALARS and codegen.yml.`);
    }
    named.name = scalarName;
    types.push({
      ...jsonScalar,
      name: scalarName,
      description: `The \`${coordinate}\` payload. codegen.yml maps this scalar to the app model that reads it.`,
    });
  }
  return introspection;
}
