import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as AppBase } from '../shared/app';
import { LoaderRenderConfig } from '../types';

interface Props {
  readonly config: LoaderRenderConfig;
  readonly codeRevision: number;
}

export const App = (props: Props) => (
  <BrowserRouter>
    <AppBase {...props} />
  </BrowserRouter>
);
