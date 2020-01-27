import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';
import { Labels, labelsToTags } from '@neo-one/utils';
import { serverLogger } from '@neotracker/logger';
import { bodyParser } from '@neotracker/server-utils-koa';
// @ts-ignore
import { routes } from '@neotracker/shared-web';
import fetch from 'cross-fetch';
import { Context } from 'koa';
import compose from 'koa-compose';

const labelNames: ReadonlyArray<string> = [Labels.HTTP_URL, Labels.HTTP_STATUS_CODE];

const requestSec = globalStats.createMeasureInt64('requests/duration', MeasureUnit.SEC);
const requestFailures = globalStats.createMeasureInt64('requets/failures', MeasureUnit.UNIT);

const SERVER_PROXY_HTTP_CLIENT_REQUEST_DURATION_SECONDS = globalStats.createView(
  'server_proxy_http_client_request_duration_seconds',
  requestSec,
  AggregationType.DISTRIBUTION,
  labelsToTags(labelNames),
  'distribution of the http client requests duration',
  [1, 2, 5, 7.5, 10, 12.5, 15, 17.5, 20],
);
globalStats.registerView(SERVER_PROXY_HTTP_CLIENT_REQUEST_DURATION_SECONDS);

const SERVER_PROXY_HTTP_CLIENT_REQUEST_FAILURES_TOTAL = globalStats.createView(
  'server_proxy_http_client_request_failures_total',
  requestFailures,
  AggregationType.COUNT,
  labelsToTags(labelNames),
  'total http client request failures',
);
globalStats.registerView(SERVER_PROXY_HTTP_CLIENT_REQUEST_FAILURES_TOTAL);

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
          const startTime = Date.now();
          response = await fetch(reportURL, {
            method: ctx.method,
            headers,
            // tslint:disable-next-line no-any
            body: JSON.stringify((ctx.request as any).fields),
          });

          ({ status } = response);
          globalStats.record([
            {
              measure: requestSec,
              value: Date.now() - startTime,
            },
          ]);
        } finally {
          // tslint:disable-next-line no-object-mutation
          logInfo[Labels.HTTP_STATUS_CODE] = status;
        }
      } catch (error) {
        globalStats.record([
          {
            measure: requestFailures,
            value: 1,
          },
        ]);
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
