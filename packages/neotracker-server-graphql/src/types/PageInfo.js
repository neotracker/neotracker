/* @flow */
import { Type } from '../lib';

export default class PageInfo extends Type {
  static typeName = 'PageInfo';
  static definition = {
    hasNextPage: 'Boolean!',
    hasPreviousPage: 'Boolean!',
    startCursor: 'String',
    endCursor: 'String',
  };
}
