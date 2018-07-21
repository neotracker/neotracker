import { Base } from '@neotracker/server-db';
import { FilterInput as FilterInputType, OrderByInput as OrderByInputType } from '@neotracker/shared-graphql';
import { QueryBuilder } from 'objection';
import { FilterInput, OrderByInput } from '../inputs';

export const filterForFilterOrderBy = ({
  query,
  model,
  filters,
  orderBy,
}: {
  // tslint:disable-next-line no-any
  readonly query: QueryBuilder<any>;
  readonly model: typeof Base;
  readonly filters?: ReadonlyArray<FilterInputType>;
  readonly orderBy?: ReadonlyArray<OrderByInputType>;
}) => {
  if (filters !== undefined) {
    FilterInput.modifyQuery(query, model, filters);
  }
  if (orderBy !== undefined) {
    OrderByInput.modifyQuery(query, model, orderBy);
  }
};
