import { CodedError } from '@neotracker/server-utils';
import { ucFirst } from 'change-case';
import { GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../GraphQLContext';

// tslint:disable-next-line no-unnecessary-class
export class Mutation {
  public static readonly mutationName: string;
  public static readonly args: { readonly [field: string]: string };
  public static readonly responseFields: { readonly [field: string]: string };

  public static get inputTypeName(): string {
    return `${ucFirst(this.mutationName)}Input`;
  }

  public static get responseTypeName(): string {
    return `${ucFirst(this.mutationName)}Response`;
  }

  public static get field(): string {
    return `${this.mutationName}(input: ${this.inputTypeName}!): ` + `${this.responseTypeName}`;
  }

  public static get inputType(): string {
    return `
      input ${this.inputTypeName} {
        ${this.concatFields(this.args).join('\n      ')}
      }
    `;
  }

  public static get type(): string {
    return `
      type ${this.responseTypeName} {
        ${this.concatFields(this.responseFields).join('\n      ')}
      }
    `;
  }

  // tslint:disable no-any
  public static async resolver(
    _obj: any,
    _args: any,
    _context: GraphQLContext,
    _info: GraphQLResolveInfo,
  ): Promise<any> {
    await Promise.reject(new CodedError(CodedError.PROGRAMMING_ERROR));
  }
  // tslint:enable no-any

  public static concatFields(fields: { readonly [field: string]: string }): ReadonlyArray<string> {
    return Object.entries(fields).map(([field, typeName]) => `${field}: ${typeName}`);
  }
}
