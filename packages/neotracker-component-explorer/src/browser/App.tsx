import * as React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { App as AppBase } from '../shared/app';
import { LoaderRenderConfig } from '../types';

interface Props {
  readonly config: LoaderRenderConfig;
  readonly codeRevision: number;
}

// tslint:disable-next-line no-any
const Router: any = process.env.COMPONENT_EXPLORER_ROUTER === 'memory' ? MemoryRouter : BrowserRouter;

export const App = (props: Props) => (
  <Router>
    <AppBase {...props} />
  </Router>
);
