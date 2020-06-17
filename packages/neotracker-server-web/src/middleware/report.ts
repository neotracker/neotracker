import { Labels } from '@neo-one/utils';
import { serverLogger } from '@neotracker/logger';
import { bodyParser } from '@neotracker/server-utils-koa';
// @ts-ignore
import { routes } from '@neotracker/shared-web';
import fetch from 'cross-fetch';
import { Context } from 'koa';
import compose from 'koa-compose';

export const report = ({ reportURL }: { readonly reportURL?: string }) => ({
  type: 'route',
  name: 'report',
  method: 'post',
  path: routes.REPORT,
  middleware: compose([
    bodyParser(),
    async (ctx: Context): Promise<void> => {
      if (reportURL === undefined) {
        ctx.status = 200;

        return;
      }
      const headers = { ...ctx.header };
      const logInfo = {
        title: 'server_proxy_http_client_request',
        [Labels.HTTP_URL]: reportURL,
        [Labels.HTTP_METHOD]: ctx.method,
        [Labels.SPAN_KIND]: 'client',
        ...headers,
      };
      let response;
      let status = -1;
      try {
        try {
          response = await fetch(reportURL, {
            method: ctx.method,
            headers,
            // tslint:disable-next-line no-any
            body: JSON.stringify((ctx.request as any).fields),
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
