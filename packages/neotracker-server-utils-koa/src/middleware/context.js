/* @flow */
import type { Context } from 'koa';
import { KnownLabel, type Monitor, metrics } from '@neo-one/monitor';

import { getUA } from 'neotracker-server-utils';
import uuidV4 from 'uuid/v4';
import { routes } from 'neotracker-shared-web';
import { sanitizeError, ua } from 'neotracker-shared-utils';

import { getMonitor, simpleMiddleware } from './common';

const RATE_LIMIT_ERROR_CODE = 429;

const labelNames = [
  KnownLabel.HTTP_PATH,
  KnownLabel.HTTP_STATUS_CODE,
  KnownLabel.HTTP_METHOD,
];
const HTTP_SERVER_REQUEST_DURATION_SECONDS = metrics.createHistogram({
  name: 'http_server_request_duration_seconds',
  labelNames,
});
const HTTP_SERVER_REQUEST_FAILURES_TOTAL = metrics.createCounter({
  name: 'http_server_request_failures_total',
  labelNames,
});

export default ({ monitor: monitorIn }: {| monitor: Monitor |}) =>
  simpleMiddleware(
    'context',
    async (ctx: Context, next: () => Promise<void>) => {
      ctx.state.nonce = uuidV4();
      // $FlowFixMe
      ctx.req.nonce = ctx.state.nonce;

      const { userAgent, type, error: userAgentError } = getUA(
        ctx.request.headers['user-agent'],
      );
      ctx.state.userAgent = userAgent;

      const monitor = monitorIn
        .forContext(ctx)
        .withLabels(ua.convertLabels(userAgent));

      if (type === 'error' && userAgentError != null) {
        monitor.logError({
          name: 'server_user_agent_parse_error',
          error: userAgentError,
        });
      }

      try {
        await monitor.forContext(ctx).captureSpanLog(
          async span => {
            try {
              ctx.state.monitor = span;
              await next();
            } finally {
              span.setLabels({
                [monitor.labels.HTTP_STATUS_CODE]: ctx.status,
                [monitor.labels.HTTP_PATH]: 'unknown',
              });
              const { router, routerName } = ctx;
              if (router != null && routerName != null) {
                const layer = router.route(routerName);
                if (layer) {
                  span.setLabels({
                    [monitor.labels.HTTP_PATH]: layer.path,
                  });
                }
              }
            }
          },
          {
            name: 'http_server_request',
            level: { log: 'verbose', span: 'info' },
            metric: {
              total: HTTP_SERVER_REQUEST_DURATION_SECONDS,
              error: HTTP_SERVER_REQUEST_FAILURES_TOTAL,
            },
            trace: true,
            // TODO: Add this back in once we have client traces
            // references: [
            //   monitor.childOf(
            //     monitor.extract(monitor.formats.HTTP, ctx.headers),
            //   ),
            // ],
          },
        );
      } catch (error) {
        if (error.status === RATE_LIMIT_ERROR_CODE) {
          throw error;
        } else if (ctx.path === routes.ERROR) {
          ctx.throw(
            error.status != null ? error.status : 500,
            sanitizeError(error).clientMessage,
          );
        } else if (ctx.request.method === 'GET' && !ctx.response.headerSent) {
          ctx.redirect(routes.ERROR);
        } else {
          throw error;
        }
      }
    },
  );

export const onError = ({ monitor: monitorIn }: {| monitor: Monitor |}) => (
  error: Error,
  ctx?: Context,
) => {
  let monitor = monitorIn;
  if (ctx != null) {
    try {
      monitor = getMonitor(ctx);
    } catch (err) {
      // Ignore errors
    }
  }

  monitor.logError({
    name: 'http_server_request_uncaught_error',
    message: 'Unexpected uncaught request error.',
    error,
  });
};
