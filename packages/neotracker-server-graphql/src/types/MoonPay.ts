import { Type } from '../lib';

export class MoonPay extends Type {
  public static readonly typeName = 'MoonPay';
  public static readonly definition = {
    secureUrl: 'String!',
  };
}
