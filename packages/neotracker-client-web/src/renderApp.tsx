import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

// @ts-ignore
import { App, AppContext, createTheme, ThemeProvider } from '@neotracker/shared-web';
import { hydrate, render, unmountComponentAtNode } from 'react-dom';

// tslint:disable-next-line no-let no-any
let container: any;
// tslint:disable-next-line no-any
export function renderApp(store: any, appContext: AppContext, theApp?: any): void {
  // tslint:disable-next-line variable-name
  const AppComponent = theApp || App;
  const app = (
    <ThemeProvider theme={createTheme()}>
      <Provider store={store}>
        <BrowserRouter>
          <AppComponent relayEnvironment={appContext.environment} appContext={appContext} />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );

  if (container == undefined) {
    container = document.querySelector('#app');
  }

  if (container != undefined) {
    hydrate(app, container);
    // Totally broken - SSR causes class name ids to be different and
    // for some reason hydrating doesn't replace the class names
    unmountComponentAtNode(container);
    render(app, container);
  }
}
