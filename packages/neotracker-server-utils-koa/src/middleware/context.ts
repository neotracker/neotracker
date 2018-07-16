import { KnownLabel, metrics, Monitor } from '@neo-one/monitor';
import { Context } from 'koa';
import { getUA } from 'neotracker-server-utils';
import { sanitizeError, ua } from 'neotracker-shared-utils';
import v4 from 'uuid/v4';
import { getMonitor, simpleMiddleware } from './common';

const RATE_LIMIT_ERROR_CODE = 429;

const labelNames: ReadonlyArray<string> = [KnownLabel.HTTP_PATH, KnownLabel.HTTP_STATUS_CODE, KnownLabel.HTTP_METHOD];

const HTTP_SERVER_REQUEST_DURATION_SECONDS = metrics.createHistogram({
  name: 'http_server_request_duration_seconds',
  labelNames,
});

const HTTP_SERVER_REQUEST_FAILURES_TOTAL = metrics.createCounter({
  name: 'http_server_request_failures_total',
  labelNames,
});

// tslint:disable-next-line no-any
const defaultHandleError = (ctx: Context, error: any) => {
  if (error.status === RATE_LIMIT_ERROR_CODE) {
    throw error;
  }

  ctx.throw(error.status != undefined ? error.status : 500, sanitizeError(error).clientMessage);
};

export const context = ({
  monitor: monitorIn,
  handleError = defaultHandleError,
}: {
  readonly monitor: Monitor;
  // tslint:disable-next-line no-any
  readonly handleError?: (ctx: Context, error: any) => void;
}) =>
  simpleMiddleware('context', async (ctx: Context, next: (() => Promise<void>)) => {
    ctx.state.nonce = v4();
    // @ts-ignore
    ctx.req.nonce = ctx.state.nonce;

    const { userAgent, type, error: userAgentError } = getUA(ctx.request.headers['user-agent']);

    ctx.state.userAgent = userAgent;

    const monitor = monitorIn.forContext(ctx).withLabels(ua.convertLabels(userAgent));

    if (type === 'error' && userAgentError != undefined) {
      monitor.logError({
        name: 'server_user_agent_parse_error',
        error: userAgentError,
      });
    }

    try {
      await monitor.forContext(ctx).captureSpanLog(
        async (span) => {
          try {
            ctx.state.monitor = span;
            await next();
          } finally {
            span.setLabels({
              [monitor.labels.HTTP_STATUS_CODE]: ctx.status,
              [monitor.labels.HTTP_PATH]: 'unknown',
            });

            // @ts-ignore
            const { router, routerName } = ctx;
            if (router != undefined && routerName != undefined) {
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
          error: {},
        },
      );
    } catch (error) {
      handleError(ctx, error);
    }
  });

export const onError = ({ monitor: monitorIn }: { readonly monitor: Monitor }) => (error: Error, ctx?: Context) => {
  let monitor = monitorIn;
  if (ctx !== undefined) {
    try {
      monitor = getMonitor(ctx);
    } catch {
      // Ignore errors
    }
  }

  monitor.logError({
    name: 'http_server_request_uncaught_error',
    message: 'Unexpected uncaught request error.',
    error,
  });
};
