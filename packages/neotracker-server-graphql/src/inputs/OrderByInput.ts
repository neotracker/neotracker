import { Base } from '@neotracker/server-db';
import { OrderByInput as OrderByInputType } from '@neotracker/shared-graphql';
import { QueryBuilder, RelationExpression } from 'objection';
import { Input } from '../lib';
import { getRelationExpressionForColumns } from '../utils';

export class OrderByInput extends Input {
  public static readonly inputName = 'OrderByInput';
  public static readonly definition = {
    name: 'String!',
    direction: 'String!',
    type: 'String',
  };

  public static modifyQuery(
    // tslint:disable-next-line no-any
    query: QueryBuilder<any>,
    _model: typeof Base,
    orderBys: ReadonlyArray<OrderByInputType>,
  ): void {
    orderBys.forEach((orderBy) => query.orderBy(orderBy.name, orderBy.direction));
  }

  public static getJoinRelation(
    model: typeof Base,
    orderBys: ReadonlyArray<OrderByInputType>,
  ): RelationExpression | undefined {
    return getRelationExpressionForColumns(
      model,
      orderBys.filter((orderBy) => orderBy.type !== 'literal').map((orderBy) => orderBy.name),
    );
  }
}
