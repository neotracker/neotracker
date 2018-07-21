import { Base, Edge } from '@neotracker/server-db';
import { Model, RelationExpression } from 'objection';

// tslint:disable-next-line no-any
function buildEagerWorker(fields: any, model: typeof Base): string | undefined {
  let numExpressions = 0;
  let expression = '';
  Object.entries(fields).forEach(([fieldName, fieldValue]) => {
    const edge = (model.modelSchema.edges === undefined ? {} : model.modelSchema.edges)[fieldName] as Edge | undefined;
    // tslint:disable-next-line no-any
    const relation = (model as any).getRelations()[fieldName];
    if (
      relation !== undefined &&
      edge !== undefined &&
      edge.exposeGraphQL &&
      !edge.computed &&
      (relation.constructor === Model.HasOneRelation || relation.constructor === Model.BelongsToOneRelation)
    ) {
      let relExpr = fieldName;
      const subExpr = buildEagerWorker(fieldValue, relation.relatedModelClass);
      if (subExpr !== undefined && subExpr.length > 0) {
        relExpr += `.${subExpr}`;
      }

      if (expression.length) {
        expression += ', ';
      }

      expression += relExpr;
      numExpressions += 1;
    }
  });

  if (numExpressions > 1) {
    expression = `[${expression}]`;
  }

  return expression;
}

// tslint:disable-next-line no-any
export const buildEager = (fields: any, model: typeof Base): RelationExpression | undefined => {
  const eager = buildEagerWorker(fields, model);

  // @ts-ignore
  return eager === undefined ? undefined : RelationExpression.parse(eager);
};
