/* @flow */
import type { Monitor } from '@neo-one/monitor';
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';

import injectTapEventPlugin from 'react-tap-event-plugin';
import { configureStore } from 'neotracker-shared-web';
import { labels, ua } from 'neotracker-shared-utils';

import createAppContext from './createAppContext';
import renderApp from './renderApp';

export default ({ monitor }: {| monitor: Monitor |}) => {
  injectTapEventPlugin();

  const relayResponseCache = new RelayQueryResponseCache({
    size: 100,
    ttl: 60 * 60 * 1000, // 60 minutes
  });
  if (window.__RELAY_DATA__) {
    for (const [cacheID, variablesToResponse] of Object.entries(
      window.__RELAY_DATA__,
    )) {
      for (const [variablesSerialized, response] of Object.entries(
        variablesToResponse,
      )) {
        relayResponseCache.set(
          cacheID,
          JSON.parse(variablesSerialized),
          response,
        );
      }
    }
  }

  const userAgent = window.__USER_AGENT__;
  const appContext = createAppContext({
    network: window.__NETWORK__,
    css: window.__CSS__,
    nonce: window.__NONCE__,
    options: window.__OPTIONS__,
    userAgent,
    relayResponseCache,
    records: window.__RELAY_RECORDS__,
    monitor: monitor.withLabels({
      ...ua.convertLabels(userAgent),
      [labels.APP_VERSION]: window.__APP_VERSION__,
    }),
  });
  const store = configureStore(true);
  renderApp(store, appContext);
};
