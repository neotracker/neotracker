import { Base } from '@neotracker/server-db';
import { FilterInput as FilterInputType } from '@neotracker/shared-graphql';
import { QueryBuilder, RelationExpression } from 'objection';
import { Input } from '../lib';
import { getRelationExpressionForColumns } from '../utils';
export type Operator = '=' | '!=' | 'in' | 'is_null' | 'is_not_null';

export const OPERATORS: ReadonlyArray<string> = ['=', '!=', 'in', 'is_null', 'is_not_null'];

export class FilterInput extends Input {
  public static readonly inputName = 'FilterInput';
  public static readonly definition = {
    name: 'String!',
    operator: 'String!',
    value: 'String!',
  };

  public static modifyQuery(
    // tslint:disable-next-line no-any
    query: QueryBuilder<any>,
    _model: typeof Base,
    filters: ReadonlyArray<FilterInputType>,
  ): void {
    filters.forEach((filter) => {
      if (filter.operator === 'is_null') {
        query.whereNull(filter.name);
      } else if (filter.operator === 'is_not_null') {
        query.whereNotNull(filter.name);
      } else {
        query.where(filter.name, filter.operator, filter.value);
      }
    });
  }

  public static getJoinRelation(
    model: typeof Base,
    filters: ReadonlyArray<FilterInputType>,
  ): RelationExpression | undefined {
    return getRelationExpressionForColumns(model, filters.map((filter) => filter.name));
  }
}
