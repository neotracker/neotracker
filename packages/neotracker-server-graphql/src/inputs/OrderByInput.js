/* @flow */
import { type Base } from 'neotracker-server-db';
import { type OrderByInput as OrderByInputType } from 'neotracker-shared-graphql';
import type { QueryBuilder, RelationExpression } from 'objection';

import { Input } from '../lib';

import { getRelationExpressionForColumns } from '../utils';

export default class OrderByInput extends Input {
  static inputName = 'OrderByInput';
  static definition = {
    name: 'String!',
    direction: 'String!',
    type: 'String',
  };

  static modifyQuery(
    query: QueryBuilder,
    model: Class<Base>,
    orderBys: Array<OrderByInputType>,
  ): void {
    orderBys.forEach(orderBy =>
      query.orderByRaw(`${orderBy.name} ${orderBy.direction}`),
    );
  }

  static getJoinRelation(
    model: Class<Base>,
    orderBys: Array<OrderByInputType>,
  ): ?RelationExpression {
    return getRelationExpressionForColumns(
      model,
      orderBys
        .filter(orderBy => orderBy.type !== 'literal')
        .map(orderBy => orderBy.name),
    );
  }
}
