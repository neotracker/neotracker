/* @flow */
import { Type } from '../lib';

export default class Script extends Type {
  static typeName = 'Script';
  static definition = {
    invocation_script: 'String!',
    verification_script: 'String!',
  };
}
