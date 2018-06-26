/* @flow */
import * as React from 'react';
import type { UserAccount } from '@neo-one/client';

import classNames from 'classnames';
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import { connect } from 'react-redux';
// $FlowFixMe
import { sanitizeError } from 'neotracker-shared-utils';

import type { AppContext } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';
import { Button, Typography, withStyles } from '../../../lib/base';

import {
  selectClaiming,
  endClaiming,
  startClaiming,
  claimError,
  claimProgress,
} from '../../../redux';
import { api as walletAPI } from '../../../wallet';

const styles = (theme: Theme) => ({
  root: {
    alignItems: 'center',
    display: 'flex',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  account: UserAccount,
  onClaimConfirmed?: ?() => void,
  className?: string,
|};
type InternalProps = {|
  claiming: boolean,
  onClaimGas: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ClaimGASButton({
  className,
  claiming,
  onClaimGas,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <Button
        className={classes.button}
        disabled={claiming}
        onClick={onClaimGas}
        variant="raised"
        color="primary"
      >
        <Typography className={classes.buttonText} variant="body1">
          CLAIM GAS
        </Typography>
      </Button>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  connect(
    (state, { account }: {| account: UserAccount |}) => ({
      claiming: selectClaiming(state)[account.id.address],
    }),
    (dispatch) => ({ dispatch }),
  ),
  withHandlers({
    onClaimGas: (options) => () => {
      const {
        account,
        dispatch,
        onClaimConfirmed,
        appContext,
      } = ((options: $FlowFixMe): {|
        account: UserAccount,
        dispatch: (event: any) => void,
        onClaimConfirmed: () => void,
        appContext: AppContext,
      |});
      dispatch(startClaiming({ address: account.id.address }));
      walletAPI
        .claimAllGAS({
          appContext,
          account: account.id,
          onProgress: (progress) => {
            dispatch(claimProgress({ address: account.id.address, progress }));
            switch (progress.type) {
              case 'fetch-unspent-sending':
                break;
              case 'fetch-unspent-done':
                break;
              case 'spend-all-sending':
                break;
              case 'spend-all-confirming':
                break;
              case 'spend-all-confirmed':
                break;
              case 'spend-all-skip':
                break;
              case 'fetch-unclaimed-sending':
                break;
              case 'fetch-unclaimed-done':
                break;
              case 'claim-gas-sending':
                break;
              case 'claim-gas-confirming':
                break;
              case 'claim-gas-confirmed':
                if (onClaimConfirmed) {
                  onClaimConfirmed();
                }
                break;
              case 'claim-gas-skip':
                break;
              default:
                // eslint-disable-next-line
                (progress.type: empty);
                break;
            }
          },
        })
        .then(() => {
          dispatch(endClaiming({ address: account.id.address }));
        })
        .catch((error) => {
          dispatch(endClaiming({ address: account.id.address }));
          dispatch(
            claimError({
              address: account.id.address,
              error:
                'Claiming all GAS failed: ' +
                `${sanitizeError(error).clientMessage}. ` +
                'Please try again or refresh the page.',
            }),
          );
        });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(ClaimGASButton): React.ComponentType<ExternalProps>);
