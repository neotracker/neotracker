import * as React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { App as AppBase } from '../shared/app';
import { LoaderRenderConfig } from '../types';

interface Props {
  readonly config: LoaderRenderConfig;
  readonly codeRevision: number;
}

const Router = process.env.COMPONENT_EXPLORER_ROUTER === 'memory' ? MemoryRouter : BrowserRouter;

export const App = (props: Props) => (
  <Router>
    <AppBase {...props} />
  </Router>
);
