import { GraphQLCompositeType, GraphQLSchema } from 'graphql';
import { getArgumentValues } from 'graphql/execution/values';
import { visit, visitWithTypeInfo } from 'graphql/language';
import { FieldNode } from 'graphql/language/ast';
import { getNamedType } from 'graphql/type/definition';
import { TypeInfo } from 'graphql/utilities';
import _ from 'lodash';
import { getFieldEntryKey } from './utils';

export const collectArgumentValues = (
  schema: GraphQLSchema,
  parentType: GraphQLCompositeType,
  field: FieldNode,
  // tslint:disable-next-line no-any
  variableValues: any,
  // tslint:disable-next-line no-any
): any => {
  const typeInfo = new TypeInfo(schema);
  // tslint:disable-next-line no-any
  (typeInfo as any)._typeStack.push(parentType);
  // tslint:disable-next-line no-any
  (typeInfo as any)._parentTypeStack.push(getNamedType(parentType) as any);

  let allArgs = {};
  visit(
    field,
    visitWithTypeInfo(typeInfo, {
      Field(node) {
        const fieldDef = typeInfo.getFieldDef();
        // tslint:disable-next-line strict-boolean-expressions
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
