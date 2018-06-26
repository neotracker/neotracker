/* @flow */
import type { UnlockedLocalWallet } from '@neo-one/client';
import * as React from 'react';

import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
// $FlowFixMe
import { labels } from 'neotracker-shared-utils';
import { withRouter } from 'react-router-dom';

import type { AppContext } from '../../../AppContext';
import { NewWalletFlowBase } from '../new';

import { addShowSnackbarError } from '../../../utils';
import { api as walletAPI } from '../../../wallet';
import * as metrics from '../../../metrics';
import * as routes from '../../../routes';

type ExternalProps = {|
  wallet: UnlockedLocalWallet,
  className?: string,
|};
type InternalProps = {|
  onCreateKeystore: (nep2: string) => void,
  onContinueKeystore: () => void,
  onContinuePrivateKey: (stage: Object) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NewWalletFlow({
  wallet,
  className,
  onCreateKeystore,
  onContinueKeystore,
  onContinuePrivateKey,
}: Props): ?React.Element<any> {
  return (
    <NewWalletFlowBase
      className={className}
      privateKey={wallet.privateKey}
      allowPrivateKeyContinue
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
    onCreateKeystore: ({
      wallet,
      appContext: appContextIn,
      showSnackbarError,
    }) => async (password: string) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      try {
        await appContext.monitor
          .withLabels({
            [labels.CREATE_KEYSTORE_NEW]: false,
          })
          .captureLog(
            () =>
              walletAPI.convertAccount({
                appContext,
                wallet,
                password,
              }),
            {
              name: 'neotracker_wallet_new_flow_password',
              level: 'verbose',
              error: {
                metric:
                  metrics.NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_FAILURES_TOTAL,
              },
              metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_PASSWORD_TOTAL,
            },
          );
      } catch (error) {
        showSnackbarError(error);
      }
    },
    onContinueKeystore: ({ appContext: appContextIn }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor
        .withLabels({
          [labels.CREATE_KEYSTORE_NEW]: false,
        })
        .log({
          name: 'neotracker_wallet_new_flow_keystore',
          error: {
            metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_FAILURES_TOTAL,
          },
          metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_KEYSTORE_TOTAL,
        });
    },
    onContinuePrivateKey: ({ appContext: appContextIn, history }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor
        .withLabels({
          [labels.CREATE_KEYSTORE_NEW]: false,
        })
        .log({
          name: 'neotracker_wallet_new_flow_private_key',
          level: 'verbose',
          error: {
            metric:
              metrics.NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_FAILURES_TOTAL,
          },
          metric: metrics.NEOTRACKER_WALLET_NEW_FLOW_PRIVATE_KEY_TOTAL,
        });
      history.replace(routes.WALLET_HOME);
    },
  }),
  pure,
);

export default (enhance(NewWalletFlow): React.ComponentType<ExternalProps>);
