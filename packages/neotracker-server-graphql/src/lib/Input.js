/* @flow */
import { entries } from 'neotracker-shared-utils';

export default class Input {
  static inputName: string;
  static definition: { [argName: string]: string };

  static get typeDef(): string {
    return `
      input ${this.inputName} {
        ${entries(this.definition)
          .map(([fieldName, typeName]) => `${fieldName}: ${typeName}`)
          .join('\n          ')}
      }
    `;
  }
}
