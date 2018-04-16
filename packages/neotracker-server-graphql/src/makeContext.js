/* @flow */
import type { DocumentNode, GraphQLResolveInfo } from 'graphql';
import type { Monitor } from '@neo-one/monitor';
import type { RootLoader } from 'neotracker-server-db';

import type { GraphQLContext } from './GraphQLContext';

import schema from './schema';

export default function(
  rootLoader: RootLoader,
  monitorIn: Monitor,
  query: DocumentNode,
  queryID: string,
  getSpan?: () => ?Monitor,
): GraphQLContext {
  const monitor = monitorIn.at('graphql');
  const getMonitor = () => {
    if (getSpan == null) {
      return monitor;
    }

    const span = getSpan();
    return span == null ? monitor : span.at('graphql');
  };
  const spans = {};
  return {
    rootLoader,
    query,
    queryID,
    schema,
    spans,
    getMonitor: (info?: GraphQLResolveInfo): Monitor => {
      if (info == null) {
        return getMonitor();
      }

      const { prev } = info.path;
      let span = prev == null ? undefined : spans[prev.key];
      if (span == null) {
        span = getMonitor();
      }
      return span;
    },
  };
}
