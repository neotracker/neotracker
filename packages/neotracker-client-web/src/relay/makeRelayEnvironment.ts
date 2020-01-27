import { Labels } from '@neo-one/utils';
import { clientLogger } from '@neotracker/logger';
import { QueryDeduplicator } from '@neotracker/shared-graphql';
import { ClientError } from '@neotracker/shared-utils';
import debug from 'debug';
// @ts-ignore
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
// @ts-ignore
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';
import { concat, interval, of as _of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LiveClient } from './LiveClient';

const POLLING_TIME_MS = 15000;

const logger = debug('NEOTRACKER:MakeRelayEnvironment');

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
  labels,
}: {
  readonly endpoint: string;
  readonly relayResponseCache: RelayQueryResponseCache;
  readonly labels: Record<string, string>;
}): Network {
  const queryDeduplicator = new QueryDeduplicator(async (queries) => {
    const body = JSON.stringify(queries);
    const commonLogInfo = {
      [Labels.SPAN_KIND]: 'client',
      [Labels.HTTP_METHOD]: 'POST',
      [Labels.PEER_SERVICE]: 'graphql',
      [Labels.HTTP_PATH]: endpoint,
      ...labels,
    };
    clientLogger.info({ title: 'relay_client_graphql_fetch', ...commonLogInfo });
    logger('%o', { level: 'debug', title: 'relay_client_graphql_fetch', ...commonLogInfo });

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
          title: 'relay_client_graphql_fetch_error',
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
          title: 'relay_client_graphql_fetch_error',
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

  let liveClient: LiveClient | undefined;
  try {
    liveClient = new LiveClient({
      endpoint: getWebsocketEndpoint(endpoint),
      labels,
    });
  } catch (error) {
    const logInfo = { title: 'relay_create_live_client_error', error: error.message, ...labels };
    clientLogger.error({ ...logInfo });
    logger('%o', { level: 'error', ...logInfo });
  }

  // tslint:disable-next-line no-any
  return Network.create((operation: any, variables: any) => {
    const { id, text } = operation;
    const query = id || text;
    if (isMutation(operation)) {
      return queryDeduplicator.execute({ id, variables }).then((result) => {
        relayResponseCache.clear();

        return result;
      });
    }

    const result$ =
      liveClient === undefined
        ? interval(POLLING_TIME_MS).pipe(switchMap(async () => queryDeduplicator.execute({ id, variables })))
        : liveClient.request$({ id: query, variables });

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
  labels,
  relayResponseCache,
  records,
}: {
  readonly endpoint: string;
  readonly labels: Record<string, string>;
  readonly relayResponseCache: RelayQueryResponseCache;
  // tslint:disable-next-line no-any
  readonly records?: any;
}) {
  return new Environment({
    network: createNetwork({ endpoint, relayResponseCache, labels }),
    store: new Store(new RecordSource(records)),
  });
}
