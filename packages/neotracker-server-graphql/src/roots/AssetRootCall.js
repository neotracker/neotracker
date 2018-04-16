/* @flow */
import type { GraphQLResolveInfo } from 'graphql';

import BlockchainRootCall from './BlockchainRootCall';
import type { GraphQLContext } from '../GraphQLContext';

export default class AssetRootCall extends BlockchainRootCall {
  static fieldName: string = 'asset';
  static typeName: string = 'Asset';
  static args: { [fieldName: string]: string } = {
    hash: 'String!',
  };

  static resolver = async (
    obj: Object,
    { hash }: { [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ): Promise<any> =>
    context.rootLoader.hashLoaders.asset.load({
      id: hash,
      monitor: context.getMonitor(info),
    });
}
