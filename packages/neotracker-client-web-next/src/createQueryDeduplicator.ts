import { Monitor } from '@neo-one/monitor';
import fetch from 'cross-fetch';
import { QueryDeduplicator } from 'neotracker-shared-graphql';
import { ClientError } from 'neotracker-shared-utils';

export const createQueryDeduplicator = ({
  endpoint,
  monitor: monitorOuter,
}: {
  readonly endpoint: string;
  readonly monitor: Monitor;
}) =>
  new QueryDeduplicator(async (queries, monitor) => {
    const body = JSON.stringify(queries);

    return monitor
      .withLabels({
        [monitor.labels.SPAN_KIND]: 'client',
        [monitor.labels.HTTP_METHOD]: 'POST',
        [monitor.labels.PEER_SERVICE]: 'graphql',
        [monitor.labels.HTTP_PATH]: endpoint,
      })
      .captureSpan(
        async (span) => {
          const headers = {
            'Content-Type': 'application/json',
          };

          // tslint:disable-next-line no-any
          span.inject(span.formats.HTTP, headers as any);

          return fetch(endpoint, {
            method: 'POST',
            body,
            headers,
            credentials: 'same-origin',
          }).then(
            async (response) => {
              span.setLabels({
                [span.labels.HTTP_STATUS_CODE]: response.status,
              });

              if (response.ok) {
                return response.json();
              }
              const error = await ClientError.getFromResponse(response);
              span.logError({
                name: 'graphql_client_fetch_error',
                error,
              });

              throw error;
            },
            (error) => {
              span.setLabels({
                [span.labels.HTTP_STATUS_CODE]: -1,
              });

              span.logError({
                name: 'graphql_client_fetch_error',
                error,
              });

              throw ClientError.getFromNetworkError(error);
            },
          );
        },
        { name: 'graphql_client_fetch' },
      );
  }, monitorOuter);
