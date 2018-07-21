/* @flow */
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import * as React from 'react';

// $FlowFixMe
import { labels } from '@neotracker/shared-utils';
import { withRouter } from 'react-router-dom';

import type { AppContext } from '../../../AppContext';

import { addShowSnackbarError } from '../../../utils';
import { api as walletAPI } from '../../../wallet';
import * as metrics from '../../../metrics';
import * as routes from '../../../routes';

import NewWalletFlowBase from './NewWalletFlowBase';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  onCreateKeystore: (password: string) => void,
  onContinueKeystore: () => void,
  onContinuePrivateKey: (stage: Object) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NewWalletFlow({
  className,
  onCreateKeystore,
  onContinueKeystore,
  onContinuePrivateKey,
}: Props): ?React.Element<any> {
  return (
    <NewWalletFlowBase
      className={className}
      onCreateKeystore={onCreateKeystore}
      onContinueKeystore={onContinueKeystore}
      onContinuePrivateKey={onContinuePrivateKey}
    />
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  addShowSnackbarError,
  withRouter,
  withHandlers({
    onCreateKeystore: ({ appContext: appContextIn }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor
        .withLabels({
          [labels.CREATE_KEYSTORE_NEW]: true,
        })
        .log({
          name: 'neotracker_wallet_new_flow_password',
          level: 'verbose',
          error: {
            metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_FAILURES_TOTAL,
          },
          metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_TOTAL,
        });
    },
    onContinueKeystore: ({ appContext: appContextIn }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor
        .withLabels({
          [labels.CREATE_KEYSTORE_NEW]: true,
        })
        .log({
          name: 'neotracker_wallet_new_flow_keystore',
          error: {
            metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_FAILURES_TOTAL,
          },
          metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_TOTAL,
        });
    },
    onContinuePrivateKey: ({
      history,
      appContext: appContextIn,
      showSnackbarError,
    }) => (stage) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor
        .withLabels({
          [labels.CREATE_KEYSTORE_NEW]: true,
        })
        .captureLog(
          () =>
            walletAPI.addAccount({
              appContext,
              privateKey: stage.privateKey,
              password: stage.password,
              nep2: stage.nep2,
            }),
          {
            name: 'neotracker_wallet_new_flow_private_key',
            level: 'verbose',
            error: {
              metric:
                metrics.NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_FAILURES_TOTAL,
            },
            metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_TOTAL,
          },
        )
        .then(() => {
          history.replace(routes.WALLET_HOME);
        })
        .catch((error) => {
          showSnackbarError(error);
        });
    },
  }),
  pure,
);

export default (enhance(NewWalletFlow): React.ComponentType<ExternalProps>);
