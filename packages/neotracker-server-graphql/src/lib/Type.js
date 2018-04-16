/* @flow */
import { entries } from 'neotracker-shared-utils';

export default class Type {
  static typeName: string;
  static definition: { [argName: string]: string };

  static get typeDef(): string {
    const implementsNode = this.definition.id == null ? '' : 'implements Node ';
    return `
      type ${this.typeName} ${implementsNode}{
        ${entries(this.definition)
          .map(([fieldName, typeName]) => `${fieldName}: ${typeName}`)
          .join('\n          ')}
      }
    `;
  }
}
