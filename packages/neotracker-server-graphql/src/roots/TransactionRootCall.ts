import { GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../GraphQLContext';
import { BlockchainRootCall } from './BlockchainRootCall';

export class TransactionRootCall extends BlockchainRootCall {
  public static readonly fieldName: string = 'transaction';
  public static readonly typeName: string = 'Transaction';
  public static readonly args: { readonly [fieldName: string]: string } = {
    hash: 'String!',
  };

  // tslint:disable no-any
  public static readonly resolver = async (
    _obj: any,
    { hash }: { readonly [key: string]: any },
    context: GraphQLContext,
    _info: GraphQLResolveInfo,
  ): Promise<any> =>
    // tslint:enable no-any
    context.rootLoader.transactionHashLoader.load({
      id: hash,
    });
}
