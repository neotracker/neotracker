/* @flow */
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import * as React from 'react';

// $FlowFixMe
import { labels } from '@neotracker/shared-utils';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
import { withRouter } from 'react-router-dom';

import type { AppContext } from '../../../AppContext';

import { addShowSnackbarError } from '../../../utils';
import { api as walletAPI } from '../../../wallet';
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
}: Props): React.Element<any> | null {
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
    onCreateKeystore: () => () => {
      webLogger.info({
        name: 'neotracker_wallet_new_flow_password',
        [labels.CREATE_KEYSTORE_NEW]: true,
      });
    },
    onContinueKeystore: () => () => {
      webLogger.info({
        title: 'neotracker_wallet_new_flow_keystore',
        [labels.CREATE_KEYSTORE_NEW]: true,
      });
    },
    onContinuePrivateKey: ({
      history,
      appContext: appContextIn,
      showSnackbarError,
    }) => (stage) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      webLogger.info({
        title: 'neotracker_wallet_new_flow_private_key',
        [labels.CREATE_KEYSTORE_NEW]: true,
      });
      walletAPI
        .addAccount({
          appContext,
          privateKey: stage.privateKey,
          password: stage.password,
          nep2: stage.nep2,
        })
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
