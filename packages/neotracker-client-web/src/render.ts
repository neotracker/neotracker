import { labels, ua } from '@neotracker/shared-utils';
// @ts-ignore
import { configureStore } from '@neotracker/shared-web';
// @ts-ignore
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';
import { createAppContext } from './createAppContext';
import { renderApp } from './renderApp';

export const render = () => {
  const relayResponseCache = new RelayQueryResponseCache({
    size: 100,
    ttl: 60 * 60 * 1000, // 60 minutes
  });

  // tslint:disable-next-line no-any
  const currentWindow = window as any;
  if (currentWindow.__RELAY_DATA__) {
    Object.entries(currentWindow.__RELAY_DATA__).forEach(([cacheID, variablesToResponse]) => {
      Object.entries(variablesToResponse as object).forEach(([variablesSerialized, response]) => {
        relayResponseCache.set(cacheID, JSON.parse(variablesSerialized), response);
      });
    });
  }

  const userAgent = currentWindow.__USER_AGENT__;
  const appContext = createAppContext({
    network: currentWindow.__NETWORK__,
    css: currentWindow.__CSS__,
    nonce: currentWindow.__NONCE__,
    options: currentWindow.__OPTIONS__,
    userAgent,
    relayResponseCache,
    records: currentWindow.__RELAY_RECORDS__,
    labels: {
      ...ua.convertLabels(userAgent),
      [labels.APP_VERSION]: currentWindow.__APP_VERSION__,
    },
  });

  const store = configureStore(true);
  renderApp(store, appContext);
};
