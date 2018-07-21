import * as React from 'react';
import { Route, Switch } from 'react-router';
import { LoaderRenderConfig } from '../../types';
import { AppShell } from './AppShell';
import { ScrollToTop, Sections } from './components';
import { getRenderConfig } from './utils';

interface Props {
  readonly config: LoaderRenderConfig;
  readonly codeRevision: number;
}
export const App = ({ config, codeRevision }: Props) => (
  <AppShell config={getRenderConfig(config)} codeRevision={codeRevision}>
    <ScrollToTop>
      <Switch>
        <Route path="/" component={Sections} />
      </Switch>
    </ScrollToTop>
  </AppShell>
);
