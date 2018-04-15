/* @flow */
import { Type } from '../lib';

export default class Filter extends Type {
  static typeName = 'Filter';
  static definition = {
    name: 'String!',
    operator: 'String!',
    value: 'String!',
  };
}
