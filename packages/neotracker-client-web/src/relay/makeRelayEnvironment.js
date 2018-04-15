/* @flow */
import { ClientError } from 'neotracker-shared-utils';
import { Environment, RecordSource, Store, Network } from 'relay-runtime';
import type { Monitor } from '@neo-one/monitor';
import { QueryDeduplicator } from 'neotracker-shared-graphql';
import type RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';

import { concat } from 'rxjs/observable/concat';
import { interval } from 'rxjs/observable/interval';
import { of as _of } from 'rxjs/observable/of';
import { map, switchMap } from 'rxjs/operators';

import LiveClient from './LiveClient';

const POLLING_TIME_MS = 15000;

const isMutation = operation => operation.operationKind === 'mutation';

const HTTPS = 'https';
const WSS = 'wss';
const HTTP = 'http';
const WS = 'ws';
const getWebsocketEndpoint = (endpoint: string) => {
  if (endpoint.startsWith(HTTPS)) {
    return `${WSS}${endpoint.slice(HTTPS.length)}`;
  } else if (endpoint.startsWith(HTTP)) {
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
}: {|
  endpoint: string,
  relayResponseCache: RelayQueryResponseCache,
  monitor: Monitor,
|}): Network {
  const monitorOuter = monitorOuterIn.at('relay_client_environment');
  const queryDeduplicator = new QueryDeduplicator((queries, monitor) => {
    const body = JSON.stringify(queries);
    return monitor
      .withLabels({
        [monitor.labels.SPAN_KIND]: 'client',
        [monitor.labels.HTTP_METHOD]: 'POST',
        [monitor.labels.PEER_SERVICE]: 'graphql',
        [monitor.labels.HTTP_PATH]: endpoint,
      })
      .captureSpan(
        span => {
          const headers = {
            'Content-Type': 'application/json',
          };
          span.inject(span.formats.HTTP, headers);
          return fetch(endpoint, {
            method: 'POST',
            body,
            headers,
            credentials: 'same-origin',
          }).then(
            async response => {
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
            error => {
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

  let liveClient;
  try {
    liveClient = new LiveClient({
      endpoint: getWebsocketEndpoint(endpoint),
      monitor: monitorOuter,
    });
  } catch (error) {
    monitorOuter.logError({ name: 'relay_create_live_client_error', error });
  }

  return Network.create((operation, variables, { monitor }) => {
    const { id, text } = operation;
    const query = id || text;
    if (isMutation(operation)) {
      return queryDeduplicator
        .execute({ id, variables, monitor })
        .then(result => {
          relayResponseCache.clear();
          return result;
        });
    }

    let result$;
    if (liveClient == null) {
      result$ = interval(POLLING_TIME_MS).pipe(
        switchMap(() => queryDeduplicator.execute({ id, variables, monitor })),
      );
    } else {
      result$ = liveClient.request({ id: query, variables }, monitor);
    }

    let cachedPayload$ = _of();
    const cachedPayload = relayResponseCache.get(query, variables);
    if (cachedPayload != null) {
      cachedPayload$ = _of(cachedPayload);
    }

    result$ = result$.pipe(
      map(result => {
        relayResponseCache.set(query, variables, result);
        return result;
      }),
    );
    return concat(cachedPayload$, result$);
  });
}

export default function({
  endpoint,
  monitor,
  relayResponseCache,
  records,
}: {|
  endpoint: string,
  monitor: Monitor,
  relayResponseCache: RelayQueryResponseCache,
  records?: Object,
|}) {
  return new Environment({
    network: createNetwork({ endpoint, monitor, relayResponseCache }),
    store: new Store(new RecordSource(records)),
  });
}
