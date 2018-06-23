/* @flow */
import { CodedError, HTTPError } from 'neotracker-server-utils';
import { type Context } from 'koa';
import {
  QueryMap,
  createQueryDeduplicator,
  schema,
} from 'neotracker-server-graphql';

import compose from 'koa-compose';
import compress from 'koa-compress';
import { routes } from 'neotracker-shared-web';
import { sanitizeError } from 'neotracker-shared-utils';
import { bodyParser, getMonitor } from 'neotracker-server-utils-koa';

import { getRootLoader } from './common';

export default () => ({
  type: 'route',
  name: 'graphql',
  method: 'post',
  path: routes.GRAPHQL,
  middleware: compose([
    compress(),
    bodyParser(),
    async (ctx: Context) => {
      const { fields } = ctx.request;
      if (fields == null) {
        throw new HTTPError(400, HTTPError.INVALID_GRAPHQL_FIELDS_NULL);
      }

      if (!Array.isArray(fields)) {
        throw new HTTPError(400, HTTPError.INVALID_GRAPHQL_FIELDS_ARRAY);
      }

      const rootLoader = getRootLoader(ctx);
      const monitor = getMonitor(ctx);
      const queryMap = new QueryMap();
      const queryDeduplicator = createQueryDeduplicator(
        monitor,
        schema,
        queryMap,
        rootLoader,
      );
      const result = await monitor
        .withLabels({
          [monitor.labels.HTTP_PATH]: '/graphql',
          [monitor.labels.RPC_TYPE]: 'graphql',
        })
        .captureSpanLog(
          span =>
            Promise.all(
              fields.map(queryIn =>
                span
                  .captureSpanLog(
                    async innerSpan => {
                      const query = queryIn;
                      if (
                        query == null ||
                        typeof query !== 'object' ||
                        query.id == null ||
                        typeof query.id !== 'string' ||
                        query.variables == null ||
                        typeof query.variables !== 'object'
                      ) {
                        throw new CodedError(CodedError.PROGRAMMING_ERROR);
                      }

                      const response = await queryDeduplicator.execute({
                        id: (query.id: $FlowFixMe),
                        variables: (query.variables: $FlowFixMe),
                        monitor: innerSpan,
                      });
                      return response;
                    },
                    {
                      name: 'http_server_graphql_request',
                      level: { log: 'verbose', span: 'info' },
                    },
                  )
                  .catch(error => ({
                    errors: [{ message: sanitizeError(error).message }],
                  })),
              ),
            ),
          {
            name: 'http_server_graphql_batch_request',
            level: { log: 'verbose', span: 'info' },
          },
        );

      ctx.type = 'application/json';
      ctx.body = JSON.stringify(result);
    },
  ]),
});
