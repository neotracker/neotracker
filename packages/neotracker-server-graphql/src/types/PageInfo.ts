import { Type } from '../lib';

export class PageInfo extends Type {
  public static readonly typeName = 'PageInfo';
  public static readonly definition = {
    hasNextPage: 'Boolean!',
    hasPreviousPage: 'Boolean!',
    startCursor: 'String',
    endCursor: 'String',
  };
}
