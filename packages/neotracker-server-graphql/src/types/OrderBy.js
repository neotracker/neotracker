/* @flow */
import { Type } from '../lib';

export default class OrderBy extends Type {
  static typeName = 'OrderBy';
  static definition = {
    name: 'String!',
    direction: 'String!',
  };
}
