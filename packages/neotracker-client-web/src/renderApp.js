/* @flow */
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import * as React from 'react';

// $FlowFixMe
import { hydrate, render, unmountComponentAtNode } from 'react-dom';

import {
  type AppContext,
  App,
  ThemeProvider,
  createTheme,
} from 'neotracker-shared-web';

let container;
export default function renderApp(
  store: any,
  appContext: AppContext,
  TheApp?: any,
): void {
  const AppComponent = TheApp || App;
  const app = (
    <ThemeProvider theme={createTheme()}>
      <Provider store={store}>
        <BrowserRouter>
          <AppComponent
            relayEnvironment={appContext.environment}
            appContext={appContext}
          />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
  if (container == null) {
    container = document.querySelector('#app');
  }

  if (container != null) {
    hydrate(app, container);
    // TODO: Totally broken - SSR causes class name ids to be different and
    //       for some reason hydrating doesn't replace the class names
    unmountComponentAtNode(container);
    render(app, container);
  }
}
