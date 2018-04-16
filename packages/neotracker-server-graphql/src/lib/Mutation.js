/* @flow */
import { CodedError } from 'neotracker-server-utils';
import type { GraphQLResolveInfo } from 'graphql';

import { entries } from 'neotracker-shared-utils';
import { ucFirst } from 'change-case';

import { type GraphQLContext } from '../GraphQLContext';

export default class Mutation {
  static +mutationName: string;
  static args: { [field: string]: string };
  static responseFields: { [field: string]: string };

  static get inputTypeName(): string {
    return `${ucFirst(this.mutationName)}Input`;
  }

  static get responseTypeName(): string {
    return `${ucFirst(this.mutationName)}Response`;
  }

  static get field(): string {
    return (
      `${this.mutationName}(input: ${this.inputTypeName}!): ` +
      `${this.responseTypeName}`
    );
  }

  static get inputType(): string {
    return `
      input ${this.inputTypeName} {
        ${this.concatFields(this.args).join('\n      ')}
      }
    `;
  }

  static get type(): string {
    return `
      type ${this.responseTypeName} {
        ${this.concatFields(this.responseFields).join('\n      ')}
      }
    `;
  }

  static async resolver(
    obj: Object,
    args: any,
    context: GraphQLContext,
    // eslint-disable-next-line no-unused-vars
    info: GraphQLResolveInfo,
  ): Promise<any> {
    throw new CodedError(CodedError.PROGRAMMING_ERROR);
  }

  static concatFields(fields: { [field: string]: string }): Array<string> {
    return entries(fields).map(([field, typeName]) => `${field}: ${typeName}`);
  }
}
