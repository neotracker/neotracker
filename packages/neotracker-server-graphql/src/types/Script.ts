import { Type } from '../lib';

export class Script extends Type {
  public static readonly typeName = 'Script';
  public static readonly definition = {
    invocation_script: 'String!',
    verification_script: 'String!',
  };
}
