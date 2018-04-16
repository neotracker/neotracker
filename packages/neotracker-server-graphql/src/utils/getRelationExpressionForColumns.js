/* @flow */
import { type Base } from 'neotracker-server-db';
import { RelationExpression } from 'objection';

import stripColumn from './stripColumn';

export default (
  model: Class<Base>,
  values: ?Array<string>,
): ?RelationExpression =>
  (values || []).reduce((relationExpression, value) => {
    const table = stripColumn(value);
    let thisRelationExpression = null;
    if (table != null) {
      thisRelationExpression = table.replace(/:/g, '.');
    }

    if (thisRelationExpression === model.modelSchema.tableName) {
      thisRelationExpression = null;
    } else if (thisRelationExpression != null) {
      thisRelationExpression = RelationExpression.parse(thisRelationExpression);
    }
    return relationExpression == null
      ? thisRelationExpression
      : relationExpression.merge(thisRelationExpression);
  }, null);
