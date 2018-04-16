/* @flow */
import { type Base } from 'neotracker-server-db';
import {
  type FilterInput as FilterInputType,
  type OrderByInput as OrderByInputType,
} from 'neotracker-shared-graphql';
import { FilterInput, OrderByInput } from '../inputs';

export default ({
  model,
  filters,
  orderBy,
}: {
  model: Class<Base>,
  filters?: Array<FilterInputType>,
  orderBy?: Array<OrderByInputType>,
}) => {
  const filterRelationExpression =
    filters == null ? null : FilterInput.getJoinRelation(model, filters);
  const orderByRelationExpression =
    orderBy == null ? null : OrderByInput.getJoinRelation(model, orderBy);
  return filterRelationExpression == null
    ? orderByRelationExpression
    : filterRelationExpression.merge(orderByRelationExpression);
};
