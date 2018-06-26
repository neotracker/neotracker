import { Type } from '../lib';

export class OrderBy extends Type {
  public static readonly typeName = 'OrderBy';
  public static readonly definition = {
    name: 'String!',
    direction: 'String!',
  };
}
