import { GraphQLResolveInfo } from 'graphql';
import { CodedError } from 'neotracker-server-utils';
import { GraphQLContext } from '../GraphQLContext';
import { BlockchainRootCall } from './BlockchainRootCall';

export class BlockRootCall extends BlockchainRootCall {
  public static readonly fieldName: string = 'block';
  public static readonly typeName: string = 'Block';
  public static readonly args: { readonly [fieldName: string]: string } = {
    hash: 'String',
    index: 'Int',
  };

  // tslint:disable no-any
  public static readonly resolver = async (
    _obj: any,
    { hash, index }: { readonly [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ): Promise<any> => {
    // tslint:enable no-any
    if (hash == undefined && index == undefined) {
      throw new CodedError(CodedError.PROGRAMMING_ERROR);
    }

    const monitor = context.getMonitor(info);
    // Important it's in this order for the Search page
    if (index != undefined) {
      return context.rootLoader.loaders.block.load({ id: index, monitor });
    }

    return context.rootLoader.blockHashLoader.load({ id: hash, monitor });
  };
}
