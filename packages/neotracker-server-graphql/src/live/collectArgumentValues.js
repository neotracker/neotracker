/* @flow */
import type { FieldNode } from 'graphql/language/ast';
import type { GraphQLCompositeType, GraphQLSchema } from 'graphql';
import { TypeInfo } from 'graphql/utilities';

import _ from 'lodash';
import { getArgumentValues } from 'graphql/execution/values';
import { getNamedType } from 'graphql/type/definition';
import { visit, visitWithTypeInfo } from 'graphql/language';

import { getFieldEntryKey } from './utils';

export default (
  schema: GraphQLSchema,
  parentType: GraphQLCompositeType,
  field: FieldNode,
  variableValues: Object,
) => {
  const typeInfo = new TypeInfo(schema);
  typeInfo._typeStack.push(parentType);
  typeInfo._parentTypeStack.push((getNamedType(parentType): $FlowFixMe));

  let allArgs = {};
  visit(
    field,
    visitWithTypeInfo(typeInfo, {
      Field(node) {
        const fieldDef = typeInfo.getFieldDef();
        if (fieldDef) {
          const args = getArgumentValues(fieldDef, node, variableValues);
          if (!_.isEmpty(args)) {
            allArgs = { ...allArgs, [getFieldEntryKey(node)]: args };
          }
        }
      },
    }),
  );

  return allArgs;
};
