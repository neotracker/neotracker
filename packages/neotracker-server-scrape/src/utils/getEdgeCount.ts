import _ from 'lodash';

export const getEdgeCount = (
  data: ReadonlyArray<{ readonly id1: string; readonly id2: string }>,
): { readonly [id: string]: number } => _.mapValues(_.groupBy(data, ({ id1 }) => id1), (values) => values.length);
