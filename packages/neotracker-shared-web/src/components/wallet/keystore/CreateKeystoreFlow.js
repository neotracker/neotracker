/* @flow */
import type { UnlockedWallet } from '@neo-one/client-core';
import * as React from 'react';

import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
// $FlowFixMe
import { labels } from '@neotracker/shared-utils';
import { withRouter } from 'react-router-dom';

import type { AppContext } from '../../../AppContext';
import { NewWalletFlowBase } from '../new';

import { addShowSnackbarError } from '../../../utils';
import { api as walletAPI } from '../../../wallet';
import * as routes from '../../../routes';

type ExternalProps = {|
  wallet: UnlockedWallet,
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
}: Props): React.Element<any> | null {
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
        webLogger.info({
          title: 'neotracker_wallet_new_flow_password',
          [labels.CREATE_KEYSTORE_NEW]: false,
        });
        await walletAPI.convertAccount({
          appContext,
          wallet,
          password,
        });
      } catch (error) {
        webLogger.error({
          title: 'neotracker_wallet_new_flow_password',
          [labels.CREATE_KEYSTORE_NEW]: false,
        });

        showSnackbarError(error);
      }
    },
    onContinueKeystore: () => () => {
      webLogger.info({
        title: 'neotracker_wallet_new_flow_keystore',
        [labels.CREATE_KEYSTORE_NEW]: false,
      });
    },
    onContinuePrivateKey: ({ history }) => () => {
      webLogger.info({
        title: 'neotracker_wallet_new_flow_private_key',
        [labels.CREATE_KEYSTORE_NEW]: false,
      });

      history.replace(routes.WALLET_HOME);
    },
  }),
  pure,
);

export default (enhance(NewWalletFlow): React.ComponentType<ExternalProps>);
