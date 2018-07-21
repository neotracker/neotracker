import { Base } from '@neotracker/server-db';
import { RelationExpression } from 'objection';
import { stripColumn } from './stripColumn';

export const getRelationExpressionForColumns = (
  model: typeof Base,
  values: ReadonlyArray<string> = [],
): RelationExpression | undefined =>
  values.reduce<RelationExpression | undefined>((relationExpression, value) => {
    const table = stripColumn(value);
    let thisRelationExpression;
    if (table !== undefined) {
      thisRelationExpression = table.replace(/:/g, '.');
    }

    if (thisRelationExpression === model.modelSchema.tableName) {
      thisRelationExpression = undefined;
    } else if (thisRelationExpression !== undefined) {
      // @ts-ignore
      thisRelationExpression = RelationExpression.create(thisRelationExpression);
    }

    if (relationExpression === undefined) {
      return thisRelationExpression;
    }

    // @ts-ignore
    return relationExpression.merge(thisRelationExpression);
  }, undefined);
