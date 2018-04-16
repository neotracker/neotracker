/* @flow */
import type { GraphQLResolveInfo } from 'graphql';

import BlockchainRootCall from './BlockchainRootCall';
import type { GraphQLContext } from '../GraphQLContext';

export default class TransactionRootCall extends BlockchainRootCall {
  static fieldName: string = 'transaction';
  static typeName: string = 'Transaction';
  static args: { [fieldName: string]: string } = {
    hash: 'String!',
  };

  static resolver = async (
    obj: Object,
    { hash }: { [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ): Promise<any> =>
    context.rootLoader.hashLoaders.transaction.load({
      id: hash,
      monitor: context.getMonitor(info),
    });
}
