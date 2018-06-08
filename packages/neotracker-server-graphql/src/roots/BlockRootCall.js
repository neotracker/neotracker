/* @flow */
import { CodedError } from 'neotracker-server-utils';
import type { GraphQLResolveInfo } from 'graphql';

import BlockchainRootCall from './BlockchainRootCall';
import type { GraphQLContext } from '../GraphQLContext';

export default class BlockRootCall extends BlockchainRootCall {
  static fieldName: string = 'block';
  static typeName: string = 'Block';
  static args: { [fieldName: string]: string } = {
    hash: 'String',
    index: 'Int',
  };

  static resolver = async (
    obj: Object,
    { hash, index }: { [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ): Promise<any> => {
    if (hash == null && index == null) {
      throw new CodedError(CodedError.PROGRAMMING_ERROR);
    }

    const monitor = context.getMonitor(info);
    // Important it's in this order for the Search page
    if (index != null) {
      return context.rootLoader.loaders.block.load({ id: index, monitor });
    }

    return context.rootLoader.blockHashLoader.load({ id: hash, monitor });
  };
}
