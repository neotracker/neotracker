/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withContext } from 'recompose';

import type { AppContext } from './AppContext';
import AppShell from './AppShell';
import GenericLoadingPage from './pages/GenericLoadingPage';

type ExternalProps = {|
  appContext: AppContext,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
// eslint-disable-next-line
function AppServer(props: Props): React.Element<*> {
  return (
    <AppShell>
      <GenericLoadingPage />
    </AppShell>
  );
}

const enhance: HOC<*, *> = compose(
  withContext(
    {
      appContext: () => null,
    },
    ({ appContext }) => ({
      appContext,
    }),
  ),
  pure,
);

export default (enhance(AppServer): React.ComponentType<ExternalProps>);
