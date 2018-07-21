import { App, AppContext } from '@neotracker/shared-web-next';
import * as React from 'react';
import { hydrate } from 'react-dom';
import LoadableExport from 'react-loadable';
import { BrowserRouter } from 'react-router-dom';

// tslint:disable-next-line no-let no-any
let container: any;
// tslint:disable-next-line no-any
export function renderApp(appContext: AppContext, theApp?: any): void {
  // tslint:disable-next-line variable-name
  const AppComponent = theApp === undefined ? App : theApp;
  const app = (
    <BrowserRouter>
      <AppComponent appContext={appContext} />
    </BrowserRouter>
  );

  if (container == undefined) {
    container = document.getElementById('app');
  }

  if (container != undefined) {
    LoadableExport.preloadReady()
      .then(() => {
        hydrate(app, container);
      })
      .catch(() => {
        hydrate(app, container);
      });
  }
}
