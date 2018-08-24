import { createQueryDeduplicator, schema } from '@neotracker/server-graphql';
import { CodedError, HTTPError } from '@neotracker/server-utils';
import { bodyParser, getMonitor } from '@neotracker/server-utils-koa';
import { sanitizeError } from '@neotracker/shared-utils';
// @ts-ignore
import { routes } from '@neotracker/shared-web';
import { routes as routesNext } from '@neotracker/shared-web-next';
import { Context } from 'koa';
import compose from 'koa-compose';
import compress from 'koa-compress';
import { getQueryMap, getRootLoader } from './common';

export const graphql = ({ next }: { readonly next: boolean }) => {
  // NOTE: Use getQueryDeduplicator once we transition to only next
  const path = next ? routesNext.GRAPHQL : routes.GRAPHQL;

  return {
    type: 'route',
    name: 'graphql',
    method: 'post',
    path,
    middleware: compose([
      compress(),
      bodyParser(),
      async (ctx: Context) => {
        // tslint:disable-next-line no-any
        const { fields } = ctx.request as any;
        if (fields == undefined) {
          throw new HTTPError(400, HTTPError.INVALID_GRAPHQL_FIELDS_NULL);
        }

        if (!Array.isArray(fields)) {
          throw new HTTPError(400, HTTPError.INVALID_GRAPHQL_FIELDS_ARRAY);
        }

        const rootLoader = getRootLoader(ctx);
        const monitor = getMonitor(ctx);
        const queryMap = getQueryMap(ctx);
        const queryDeduplicator = createQueryDeduplicator(monitor, schema(), queryMap, rootLoader);

        const result = await monitor
          .withLabels({
            [monitor.labels.HTTP_PATH]: path,
            [monitor.labels.RPC_TYPE]: 'graphql',
          })
          .captureSpanLog(
            async (span) =>
              Promise.all(
                // tslint:disable-next-line no-any
                fields.map(async (queryIn: any) =>
                  span
                    .captureSpanLog(
                      async (innerSpan) => {
                        const query = queryIn;
                        if (
                          query == undefined ||
                          typeof query !== 'object' ||
                          query.id == undefined ||
                          typeof query.id !== 'string' ||
                          query.variables == undefined ||
                          typeof query.variables !== 'object'
                        ) {
                          throw new CodedError(CodedError.PROGRAMMING_ERROR);
                        }

                        return queryDeduplicator.execute({
                          id: query.id,
                          variables: query.variables,
                          monitor: innerSpan,
                        });
                      },
                      {
                        name: 'http_server_graphql_request',
                        level: { log: 'verbose', span: 'info' },
                      },
                    )
                    .catch((error) => ({
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
  };
};
