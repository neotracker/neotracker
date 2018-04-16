/* @flow */
import { type Base } from 'neotracker-server-db';
import { Model, RelationExpression } from 'objection';

import { entries } from 'neotracker-shared-utils';

function buildEager(fields: Object, model: Class<Base>): ?string {
  let numExpressions = 0;
  let expression = '';
  for (const [fieldName, fieldValue] of entries(fields)) {
    const edge = (model.modelSchema.edges || {})[fieldName];
    const relation = model.getRelations()[fieldName];
    if (
      relation &&
      edge &&
      edge.exposeGraphQL &&
      !edge.computed &&
      (relation.constructor === Model.HasOneRelation ||
        relation.constructor === Model.BelongsToOneRelation)
    ) {
      let relExpr = fieldName;
      const subExpr = buildEager(fieldValue, relation.relatedModelClass);
      if (subExpr != null && subExpr.length > 0) {
        relExpr += `.${subExpr}`;
      }

      if (expression.length) {
        expression += ', ';
      }

      expression += relExpr;
      numExpressions += 1;
    }
  }

  if (numExpressions > 1) {
    expression = `[${expression}]`;
  }

  return expression;
}

export default (fields: Object, model: Class<Base>): ?RelationExpression => {
  const eager = buildEager(fields, model);
  return eager == null ? null : RelationExpression.parse(eager);
};
