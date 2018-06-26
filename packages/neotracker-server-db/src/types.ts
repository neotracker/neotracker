import { Monitor } from '@neo-one/monitor';
import { GraphQLResolveInfo } from 'graphql';
import { RootLoader } from './loader';

export interface GraphQLContext {
  readonly rootLoader: RootLoader;
  readonly getMonitor: ((info?: GraphQLResolveInfo) => Monitor);
}
