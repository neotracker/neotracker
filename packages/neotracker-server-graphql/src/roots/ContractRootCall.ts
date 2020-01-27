import { GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../GraphQLContext';
import { BlockchainRootCall } from './BlockchainRootCall';

export class ContractRootCall extends BlockchainRootCall {
  public static readonly fieldName: string = 'contract';
  public static readonly typeName: string = 'Contract';
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
    context.rootLoader.loaders.contract.load({
      id: hash,
    });
}
