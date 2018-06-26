import { Type } from '../lib';

export class Filter extends Type {
  public static readonly typeName = 'Filter';
  public static readonly definition = {
    name: 'String!',
    operator: 'String!',
    value: 'String!',
  };
}
