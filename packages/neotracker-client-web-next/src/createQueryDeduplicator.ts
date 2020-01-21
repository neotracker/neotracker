import { SpanKind } from '@neo-one/client-switch';
import { Labels } from '@neo-one/utils';
import { clientLogger } from '@neotracker/logger';
import { QueryDeduplicator } from '@neotracker/shared-graphql';
import { ClientError } from '@neotracker/shared-utils';
import fetch from 'cross-fetch';
import debug from 'debug';

const logger = debug('NEOTRACKER:MakeRelayEnvironment');

export const createQueryDeduplicator = ({
  endpoint,
  labels,
}: {
  readonly endpoint: string;
  readonly labels: Record<string, string>;
}) =>
  new QueryDeduplicator(async (queries) => {
    const body = JSON.stringify(queries);
    const commonLogInfo = {
      kind: SpanKind.CLIENT,
      [Labels.SPAN_KIND]: 'client',
      [Labels.HTTP_METHOD]: 'POST',
      [Labels.PEER_SERVICE]: 'graphql',
      [Labels.HTTP_PATH]: endpoint,
      ...labels,
    };
    clientLogger.info({ title: 'graphql_client_fetch', ...commonLogInfo });
    logger('%o', { level: 'debug', title: 'graphql_client_fetch', ...commonLogInfo });

    const headers = {
      'Content-Type': 'application/json',
    };

    return fetch(endpoint, {
      method: 'POST',
      body,
      headers,
      credentials: 'same-origin',
    }).then(
      async (response) => {
        if (response.ok) {
          return response.json();
        }
        const error = await ClientError.getFromResponse(response);
        const logInfo = {
          title: 'graphql_client_fetch_error',
          [Labels.HTTP_STATUS_CODE]: response.status,
          error: error.message,
          ...commonLogInfo,
        };
        clientLogger.info({ ...logInfo });
        logger('%o', { level: 'debug', ...logInfo });

        throw error;
      },
      (error) => {
        const logInfo = {
          title: 'graphql_client_fetch_error',
          [Labels.HTTP_STATUS_CODE]: -1,
          error: error.message,
          ...commonLogInfo,
        };
        clientLogger.error({ ...logInfo });
        logger('%o', { level: 'error', ...logInfo });

        throw ClientError.getFromNetworkError(error);
      },
    );
  }, labels);
