import { Monitor } from '@neo-one/monitor';
import { QueryDeduplicator } from 'neotracker-shared-graphql';
import { ClientError } from 'neotracker-shared-utils';
// @ts-ignore
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
// @ts-ignore
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';
import { concat, interval, of as _of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LiveClient } from './LiveClient';

const POLLING_TIME_MS = 15000;

// tslint:disable-next-line no-any
const isMutation = (operation: any) => operation.operationKind === 'mutation';

const HTTPS = 'https';
const WSS = 'wss';
const HTTP = 'http';
const WS = 'ws';
const getWebsocketEndpoint = (endpoint: string) => {
  if (endpoint.startsWith(HTTPS)) {
    return `${WSS}${endpoint.slice(HTTPS.length)}`;
  }

  if (endpoint.startsWith(HTTP)) {
    return `${WS}${endpoint.slice(HTTP.length)}`;
  }

  const { location } = window;
  const proto = location.protocol === `${HTTPS}:` ? WSS : WS;

  return `${proto}://${location.host}${endpoint}`;
};

function createNetwork({
  endpoint,
  relayResponseCache,
  monitor: monitorOuterIn,
}: {
  readonly endpoint: string;
  readonly relayResponseCache: RelayQueryResponseCache;
  readonly monitor: Monitor;
}): Network {
  const monitorOuter = monitorOuterIn.at('relay_client_environment');
  const queryDeduplicator = new QueryDeduplicator(async (queries, monitor) => {
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
                name: 'relay_client_graphql_fetch_error',
                error,
              });

              throw error;
            },
            (error) => {
              span.setLabels({
                [span.labels.HTTP_STATUS_CODE]: -1,
              });

              span.logError({
                name: 'relay_client_graphql_fetch_error',
                error,
              });

              throw ClientError.getFromNetworkError(error);
            },
          );
        },
        { name: 'relay_client_graphql_fetch' },
      );
  }, monitorOuterIn);

  let liveClient: LiveClient | undefined;
  try {
    liveClient = new LiveClient({
      endpoint: getWebsocketEndpoint(endpoint),
      monitor: monitorOuter,
    });
  } catch (error) {
    monitorOuter.logError({ name: 'relay_create_live_client_error', error });
  }

  // tslint:disable-next-line no-any
  return Network.create((operation: any, variables: any, { monitor }: { readonly monitor: Monitor }) => {
    const { id, text } = operation;
    const query = id || text;
    if (isMutation(operation)) {
      return queryDeduplicator.execute({ id, variables, monitor }).then((result) => {
        relayResponseCache.clear();

        return result;
      });
    }

    const result$ =
      liveClient === undefined
        ? interval(POLLING_TIME_MS).pipe(switchMap(async () => queryDeduplicator.execute({ id, variables, monitor })))
        : liveClient.request$({ id: query, variables }, monitor);

    let cachedPayload$ = _of();
    const cachedPayload = relayResponseCache.get(query, variables);
    if (cachedPayload != undefined) {
      cachedPayload$ = _of(cachedPayload);
    }

    return concat(
      cachedPayload$,
      result$.pipe(
        map((result) => {
          relayResponseCache.set(query, variables, result);

          return result;
        }),
      ),
    );
  });
}

export function makeRelayEnvironment({
  endpoint,
  monitor,
  relayResponseCache,
  records,
}: {
  readonly endpoint: string;
  readonly monitor: Monitor;
  readonly relayResponseCache: RelayQueryResponseCache;
  // tslint:disable-next-line no-any
  readonly records?: any;
}) {
  return new Environment({
    network: createNetwork({ endpoint, monitor, relayResponseCache }),
    store: new Store(new RecordSource(records)),
  });
}
