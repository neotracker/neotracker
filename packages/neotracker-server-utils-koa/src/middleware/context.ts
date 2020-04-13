import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';
import { Labels, labelsToTags } from '@neo-one/utils';
import { serverLogger } from '@neotracker/logger';
import { getUA } from '@neotracker/server-utils';
import { sanitizeError, ua } from '@neotracker/shared-utils';
import { Context } from 'koa';
import v4 from 'uuid/v4';
import { simpleMiddleware } from './common';

const RATE_LIMIT_ERROR_CODE = 429;

const labelNames: ReadonlyArray<string> = [Labels.HTTP_PATH, Labels.HTTP_STATUS_CODE, Labels.HTTP_METHOD];

const requestSec = globalStats.createMeasureInt64('requests/duration', MeasureUnit.SEC);
const requestFailures = globalStats.createMeasureInt64('requests/failures', MeasureUnit.UNIT);

const HTTP_SERVER_REQUEST_DURATION_SECONDS = globalStats.createView(
  'http_server_request_duration_seconds',
  requestSec,
  AggregationType.DISTRIBUTION,
  labelsToTags(labelNames),
  'distribution of requests duration',
  [1, 2, 5, 7.5, 10, 12.5, 15, 17.5, 20],
);
globalStats.registerView(HTTP_SERVER_REQUEST_DURATION_SECONDS);

const HTTP_SERVER_REQUEST_FAILURES_TOTAL = globalStats.createView(
  'http_server_request_failures_total',
  requestFailures,
  AggregationType.COUNT,
  labelsToTags(labelNames),
  'total request failures',
);
globalStats.registerView(HTTP_SERVER_REQUEST_FAILURES_TOTAL);

// tslint:disable-next-line no-any
const defaultHandleError = (ctx: Context, error: any) => {
  if (error.status === RATE_LIMIT_ERROR_CODE) {
    throw error;
  }

  ctx.throw(error.status != undefined ? error.status : 500, sanitizeError(error).clientMessage);
};

export const context = ({
  handleError = defaultHandleError,
}: {
  // tslint:disable-next-line no-any
  readonly handleError?: (ctx: Context, error: any) => void;
} = {}) =>
  simpleMiddleware('context', async (ctx: Context, next: () => Promise<void>) => {
    ctx.state.nonce = v4();
    // @ts-ignore
    ctx.req.nonce = ctx.state.nonce;

    const { userAgent, type, error: userAgentError } = getUA(ctx.request.headers['user-agent']);

    ctx.state.userAgent = userAgent;
    if (type === 'error' && userAgentError != undefined) {
      serverLogger.error({
        title: 'server_user_agent_parse_error',
        ...ua.convertLabels(userAgent),
        error: userAgentError,
      });
    }
    const logInfo: Record<string, string | number | undefined> = {
      title: 'http_server_request',
      ...ua.convertLabels(userAgent),
      [Labels.HTTP_HEADERS]: JSON.stringify(ctx.headers),
    };
    const startTime = Date.now();

    try {
      try {
        await next();
      } finally {
        // tslint:disable-next-line no-object-mutation
        logInfo[Labels.HTTP_STATUS_CODE] = ctx.status;
        // tslint:disable-next-line no-object-mutation
        logInfo[Labels.HTTP_PATH] = 'unknown';
        // @ts-ignore
        const { router, routerName } = ctx;
        if (router != undefined && routerName != undefined) {
          const layer = router.route(routerName);
          if (layer) {
            // tslint:disable-next-line no-object-mutation
            logInfo[Labels.HTTP_PATH] = layer.path;
          }
        }
        globalStats.record([
          {
            measure: requestSec,
            value: Date.now() - startTime,
          },
        ]);
      }
    } catch (error) {
      serverLogger.error({ ...logInfo, error: error.message });
      globalStats.record([
        {
          measure: requestFailures,
          value: 1,
        },
      ]);
      handleError(ctx, error);
    }
    serverLogger.info({ ...logInfo });
  });

export const onError = () => (error: Error) => {
  serverLogger.error({
    title: 'http_server_request_uncaught_error',
    message: 'Unexpected uncaught request error.',
    error: error.message,
  });
};
