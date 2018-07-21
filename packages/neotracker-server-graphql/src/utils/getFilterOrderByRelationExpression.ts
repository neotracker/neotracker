import { Base } from '@neotracker/server-db';
import { FilterInput as FilterInputType, OrderByInput as OrderByInputType } from '@neotracker/shared-graphql';
import { FilterInput, OrderByInput } from '../inputs';

export const getFilterOrderByRelationExpression = ({
  model,
  filters,
  orderBy,
}: {
  readonly model: typeof Base;
  readonly filters?: ReadonlyArray<FilterInputType>;
  readonly orderBy?: ReadonlyArray<OrderByInputType>;
}) => {
  const filterRelationExpression = filters === undefined ? undefined : FilterInput.getJoinRelation(model, filters);
  const orderByRelationExpression = orderBy === undefined ? undefined : OrderByInput.getJoinRelation(model, orderBy);

  if (filterRelationExpression === undefined) {
    return orderByRelationExpression;
  }

  // @ts-ignore
  return filterRelationExpression.merge(orderByRelationExpression);
};
