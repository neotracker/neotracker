import { KnownLabel, metrics } from '@neo-one/monitor';
import { bodyParser, getMonitor } from '@neotracker/server-utils-koa';
// @ts-ignore
import { routes } from '@neotracker/shared-web';
import fetch from 'cross-fetch';
import { Context } from 'koa';
import compose from 'koa-compose';

const labelNames: ReadonlyArray<string> = [KnownLabel.HTTP_URL, KnownLabel.HTTP_STATUS_CODE];
const SERVER_PROXY_HTTP_CLIENT_REQUEST_DURATION_SECONDS = metrics.createHistogram({
  name: 'server_proxy_http_client_request_duration_seconds',
  labelNames,
});

const SERVER_PROXY_HTTP_CLIENT_REQUEST_FAILURES_TOTAL = metrics.createCounter({
  name: 'server_proxy_http_client_request_failures_total',
  labelNames,
});

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
      const monitor = getMonitor(ctx);
      const headers = { ...ctx.header };
      const response = await monitor
        .withLabels({
          [monitor.labels.HTTP_URL]: reportURL,
          [monitor.labels.HTTP_METHOD]: ctx.method,
          [monitor.labels.SPAN_KIND]: 'client',
        })
        .captureSpanLog(
          async (span) => {
            span.inject(monitor.formats.HTTP, headers);
            let status = -1;
            try {
              const resp = await fetch(reportURL, {
                method: ctx.method,
                headers,
                // tslint:disable-next-line no-any
                body: JSON.stringify((ctx.request as any).fields),
              });

              ({ status } = resp);

              return resp;
            } finally {
              span.setLabels({ [monitor.labels.HTTP_STATUS_CODE]: status });
            }
          },
          {
            name: 'server_proxy_http_client_request',
            level: { log: 'verbose', span: 'info' },
            metric: {
              total: SERVER_PROXY_HTTP_CLIENT_REQUEST_DURATION_SECONDS,
              error: SERVER_PROXY_HTTP_CLIENT_REQUEST_FAILURES_TOTAL,
            },

            trace: true,
          },
        );

      ctx.status = response.status;
      response.headers.forEach((value, key) => {
        if (key !== 'transfer-encoding' && key !== 'content-encoding') {
          ctx.set(key, value);
        }
      });
      const { body } = response;
      if (body !== null) {
        ctx.body = body;
      }
    },
  ]),
});
