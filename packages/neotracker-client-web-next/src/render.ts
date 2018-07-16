import { Monitor } from '@neo-one/monitor';
import { labels, ua } from 'neotracker-shared-utils';
import { routes } from 'neotracker-shared-web-next';
import { createApolloClient } from './createApolloClient';
import { createAppContext } from './createAppContext';
import { renderApp } from './renderApp';

export const render = ({ monitor: monitorIn }: { readonly monitor: Monitor }) => {
  // tslint:disable-next-line no-any
  const currentWindow = window as any;

  const userAgent = currentWindow.__USER_AGENT__;
  const monitor = monitorIn.withLabels({
    ...ua.convertLabels(userAgent),
    [labels.APP_VERSION]: currentWindow.__APP_VERSION__,
  });
  const appContext = createAppContext({
    apollo: createApolloClient({
      endpoint: routes.GRAPHQL,
      monitor,
      apolloState: currentWindow.__APOLLO_STATE__,
    }),
    network: currentWindow.__NETWORK__,
    css: currentWindow.__CSS__,
    nonce: currentWindow.__NONCE__,
    options: currentWindow.__OPTIONS__,
    userAgent,
    monitor,
  });

  renderApp(appContext);
};
