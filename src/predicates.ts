import lo from 'lodash';

enum WhereOperator {
  EQ = '==',
  LT = '<',
  GT = '>',
  GTE = '>=',
  LTE = '<=',
  IN = 'in',
  LIKE = 'like',
}

type WhereClause = Record<WhereOperator, any>

type WhereType = Record<string, WhereClause>

export function whereToFilter(where: WhereType, schema: Record<string, any> = {}) {

  return lo.mapValues(where, (value, name) => {

    const simpleFilter = getTypedValue(WhereOperator.EQ)

    if (simpleFilter && !lo.isArray(simpleFilter)) {
      return simpleFilter
    }

    const params: Record<string, any> = {
      $gt: getTypedValue(WhereOperator.GT),
      $lt: getTypedValue(WhereOperator.LT),
      $gte: getTypedValue(WhereOperator.GTE),
      $lte: getTypedValue(WhereOperator.LTE),
      $in: lo.get(value, WhereOperator.IN) || simpleFilter,
    }

    const { [WhereOperator.LIKE]: like } = value;

    if (like) {
      const pattern = lo.escapeRegExp(like)
        .replace(/%/g, '.*')
      // .replace(/\\(?=\[|])/g, ''), 'i')
      params.$regex = new RegExp(pattern)
    }

    return lo.pickBy(params, v => v !== undefined);

    function getTypedValue(path: WhereOperator) {
      const key = schema[name];
      const raw = lo.get(value, path);
      try {
        return (raw && key === Date) ? new Date(raw) : raw;
      } catch (e) {
        return raw;
      }
    }

  });

}

export function queryToFilter(query?: Record<string, any>, schema: Record<string, any> = {}): Record<string, any> {
  const queryKeys = Object.keys(query || {})
    .filter(name => {
      const [field] = name.match(/^[^.]+/) || [];
      return field && schema[field];
    });

  return lo.mapValues(lo.pick(query, queryKeys), (x, key) => {
    if (Array.isArray(x)) {
      return { $in: x }
    }
    if (schema[key] === Date) {
      return asDate(x)
    }
    return x || null
  })
}

function asDate(value: string | Date | Record<string, string | Date>): any {
  if (!value) {
    return null
  }
  if (typeof value === 'string') {
    return new Date(value)
  }
  if (lo.isObject(value)) {
    return lo.mapValues(value, asDate)
  }
  return value
}
