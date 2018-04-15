/* @flow */
import { type Base } from 'neotracker-server-db';
import {
  type FilterInput as FilterInputType,
  type OrderByInput as OrderByInputType,
} from 'neotracker-shared-graphql';
import type { QueryBuilder } from 'objection';

import { FilterInput, OrderByInput } from '../inputs';

export default ({
  query,
  model,
  filters,
  orderBy,
}: {|
  query: QueryBuilder,
  model: Class<Base>,
  filters?: Array<FilterInputType>,
  orderBy?: Array<OrderByInputType>,
|}) => {
  if (filters != null) {
    FilterInput.modifyQuery(query, model, filters);
  }
  if (orderBy != null) {
    OrderByInput.modifyQuery(query, model, orderBy);
  }
};
