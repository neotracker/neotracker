import { FieldType } from '@neotracker/server-db';

export function getGraphQLType(fieldType: FieldType): string {
  switch (fieldType.type) {
    case 'id':
      return 'ID';
    case 'foreignID':
      return 'ID';
    case 'boolean':
      return 'Boolean';
    case 'bigInteger':
      return 'Int';
    case 'integer':
      return 'Int';
    case 'decimal':
      return 'String';
    case 'number':
      return 'Float';
    case 'string':
      return 'String';
    case 'array':
      return `[${getGraphQLType(fieldType.items)}!]`;
    case 'model':
      return fieldType.modelType;
    default:
      throw new Error(`Type '${fieldType.type}' is not implemented`);
  }
}
