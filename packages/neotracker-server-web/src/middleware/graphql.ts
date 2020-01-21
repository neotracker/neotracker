import { Labels } from '@neo-one/utils';
import { serverLogger } from '@neotracker/logger';
import { createQueryDeduplicator, schema } from '@neotracker/server-graphql';
import { CodedError, HTTPError } from '@neotracker/server-utils';
import { bodyParser } from '@neotracker/server-utils-koa';
import { sanitizeError } from '@neotracker/shared-utils';
// @ts-ignore
import { routes } from '@neotracker/shared-web';
import { routes as routesNext } from '@neotracker/shared-web-next';
import { Context } from 'koa';
import compose from 'koa-compose';
// tslint:disable-next-line: match-default-export-name
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
        const queryMap = getQueryMap(ctx);
        const queryDeduplicator = createQueryDeduplicator(schema(), queryMap, rootLoader);

        const logInfo = {
          [Labels.HTTP_PATH]: path,
          [Labels.RPC_TYPE]: 'graphql',
        };
        serverLogger.info({ title: 'http_server_graphql_batch_request', ...logInfo });
        const result = await Promise.all(
          // tslint:disable-next-line no-any
          fields.map(async (queryIn: any) => {
            serverLogger.info({ title: 'http_server_graphql_request', ...logInfo });
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

            return queryDeduplicator
              .execute({
                id: query.id,
                variables: query.variables,
              })
              .catch((error: Error) => {
                serverLogger.error({ title: 'http_server_graphql_request', ...logInfo, error: error.message });

                return { errors: [{ message: sanitizeError(error).message }] };
              });
          }),
        );

        ctx.type = 'application/json';
        ctx.body = JSON.stringify(result);
      },
    ]),
  };
};
