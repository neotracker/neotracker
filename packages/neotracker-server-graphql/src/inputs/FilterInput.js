/* @flow */
import { type Base } from 'neotracker-server-db';
import { type FilterInput as FilterInputType } from 'neotracker-shared-graphql';
import type { QueryBuilder, RelationExpression } from 'objection';

import { Input } from '../lib';

import { getRelationExpressionForColumns } from '../utils';

export type Operator = '=' | '!=' | 'in' | 'is_null' | 'is_not_null';

export const OPERATORS = ['=', '!=', 'in', 'is_null', 'is_not_null'];

export default class FilterInput extends Input {
  static inputName = 'FilterInput';
  static definition = {
    name: 'String!',
    operator: 'String!',
    value: 'String!',
  };

  static modifyQuery(
    query: QueryBuilder,
    model: Class<Base>,
    filters: Array<FilterInputType>,
  ): void {
    filters.forEach(filter => {
      if (filter.operator === 'is_null') {
        query.whereNull(filter.name);
      } else if (filter.operator === 'is_not_null') {
        query.whereNotNull(filter.name);
      } else {
        query.where(filter.name, filter.operator, filter.value);
      }
    });
  }

  static getJoinRelation(
    model: Class<Base>,
    filters: Array<FilterInputType>,
  ): ?RelationExpression {
    return getRelationExpressionForColumns(
      model,
      filters.map(filter => filter.name),
    );
  }
}
