/* @flow */
import type { GraphQLResolveInfo } from 'graphql';

import BlockchainRootCall from './BlockchainRootCall';
import type { GraphQLContext } from '../GraphQLContext';

export default class AddressRootCall extends BlockchainRootCall {
  static fieldName: string = 'address';
  static typeName: string = 'Address';
  static args: { [fieldName: string]: string } = {
    hash: 'String!',
  };

  static resolver = async (
    obj: Object,
    { hash }: { [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ): Promise<any> =>
    context.rootLoader.loaders.address.load({
      id: hash,
      monitor: context.getMonitor(info),
    });
}
