import { Monitor, Span } from '@neo-one/monitor';
import { RootLoader } from '@neotracker/server-db';
import { DocumentNode } from 'graphql';
import { GraphQLContext } from './GraphQLContext';
import { schema } from './schema';

export function makeContext(
  rootLoader: RootLoader,
  monitorIn: Monitor,
  query: DocumentNode,
  queryID: string,
  getSpan?: (() => Monitor | undefined),
): GraphQLContext {
  const monitor = monitorIn.at('graphql');
  const getMonitor = () => {
    if (getSpan === undefined) {
      return monitor;
    }

    const span = getSpan();

    return span === undefined ? monitor : span.at('graphql');
  };
  const spans: { [K in string]?: Span } = {};

  return {
    rootLoader,
    query,
    queryID,
    schema: schema(),
    spans,
    getMonitor: (info?): Monitor => {
      if (info === undefined) {
        return getMonitor();
      }

      const { prev } = info.path;
      let span: Monitor | undefined = prev === undefined ? undefined : spans[prev.key];
      if (span === undefined) {
        span = getMonitor();
      }

      return span;
    },
  };
}
