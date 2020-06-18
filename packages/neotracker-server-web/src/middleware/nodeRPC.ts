import { Labels } from '@neo-one/utils';
import { serverLogger } from '@neotracker/logger';
import { bodyParser } from '@neotracker/server-utils-koa';
// @ts-ignore
import { routes } from '@neotracker/shared-web';
import fetch from 'cross-fetch';
import { Context } from 'koa';
import compose from 'koa-compose';

export const nodeRPC = ({ rpcURL }: { readonly rpcURL: string }) => ({
  type: 'route',
  name: 'nodeRPC',
  method: 'post',
  path: routes.RPC,
  middleware: compose([
    bodyParser({ fields: 'body' }),
    async (ctx: Context): Promise<void> => {
      const headers = { ...ctx.header };
      const logInfo = {
        title: 'server_proxy_http_client_jsonrpc_request',
        [Labels.HTTP_URL]: rpcURL,
        [Labels.HTTP_METHOD]: ctx.method,
        [Labels.RPC_TYPE]: 'jsonrpc',
        [Labels.SPAN_KIND]: 'client',
        ...headers,
      };
      let response;
      let status = -1;
      try {
        try {
          response = await fetch(rpcURL, {
            method: ctx.method,
            headers,
            // tslint:disable-next-line no-any
            body: JSON.stringify((ctx.request as any).body),
          });

          ({ status } = response);
        } finally {
          // tslint:disable-next-line no-object-mutation
          logInfo[Labels.HTTP_STATUS_CODE] = status;
        }
      } catch (error) {
        serverLogger.error({ ...logInfo, error: error.message });
      }

      serverLogger.info({ ...logInfo });
      if (response !== undefined) {
        ctx.status = response.status;
        response.headers.forEach((value: string, key: string) => {
          if (key !== 'transfer-encoding' && key !== 'content-encoding') {
            ctx.set(key, value);
          }
        });
        const { body } = response;
        if (body !== null) {
          ctx.body = body;
        }
      }
    },
  ]),
});
