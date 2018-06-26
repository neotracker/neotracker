/* @flow */
import {
  type HOC,
  compose,
  getContext,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import { Link as RRLink } from 'react-router-dom';
import * as React from 'react';
import type { LocalWallet, UserAccount } from '@neo-one/client';

import type { AppContext } from '../../../AppContext';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  withStyles,
} from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';
import { Tooltip } from '../../../lib/tooltip';

import { api as walletAPI } from '../../../wallet';
import { addShowSnackbarError } from '../../../utils';
import * as routes from '../../../routes';

import ChangeNameDialog, { CHANGE_NAME_TEXT } from './ChangeNameDialog';

const styles = (theme: Theme) => ({
  buttonText: {
    color: theme.custom.colors.common.white,
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
  },
});

type ExternalProps = {|
  account: ?UserAccount,
  wallet: ?LocalWallet,
  className?: string,
|};
type InternalProps = {|
  appContext: AppContext,
  open: boolean,
  anchorEl: any,
  openChangeName: boolean,
  onClickMenu: () => void,
  onCloseMenu: () => void,
  onClickChangeName: () => void,
  onCloseChangeNameDialog: () => void,
  onClickDeleteWallet: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SelectCardMenu({
  account,
  wallet,
  className,
  open,
  anchorEl,
  openChangeName,
  onClickMenu,
  onCloseMenu,
  onClickChangeName,
  onCloseChangeNameDialog,
  onClickDeleteWallet,
  classes,
}: Props): ?React.Element<*> {
  const makeMenuItem = ({
    path,
    onClick,
    text,
    tooltip,
    disabled: disabledIn,
  }: {|
    // eslint-disable-next-line
    path?: string,
    // eslint-disable-next-line
    onClick?: () => void,
    text: string,
    tooltip: string,
    // eslint-disable-next-line
    disabled?: boolean,
  |}) => {
    const disabled = !!disabledIn;
    let menuItem = text;

    if (path != null && !disabled) {
      menuItem = (
        <RRLink className={classes.link} to={path}>
          {menuItem}
        </RRLink>
      );
    }
    const TooltipMenuItem = (props: $FlowFixMe) => (
      <Tooltip title={tooltip} position="bottom">
        <MenuItem
          key={text}
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          {...props}
        >
          {menuItem}
        </MenuItem>
      </Tooltip>
    );

    return <TooltipMenuItem />;
  };

  let changeNameDialog;
  const canChangeName = account != null && account.configurableName;
  if (account != null && canChangeName) {
    changeNameDialog = (
      <ChangeNameDialog
        account={account}
        open={openChangeName}
        onClose={onCloseChangeNameDialog}
      />
    );
  }

  return (
    <div className={className}>
      <Button
        aria-owns={open ? 'select-card-menu' : null}
        aria-haspopup="true"
        variant="raised"
        color="primary"
        onClick={onClickMenu}
      >
        <Typography className={classes.buttonText} variant="body1">
          MENU
        </Typography>
      </Button>
      <Menu
        id="select-card-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={onCloseMenu}
      >
        {makeMenuItem({
          onClick: onClickChangeName,
          text: 'Change Name',
          tooltip: CHANGE_NAME_TEXT,
          disabled: !canChangeName,
        })}
        {makeMenuItem({
          path: routes.WALLET_CREATE_KEYSTORE,
          text: 'Change Password',
          tooltip: 'Change the password used to unlock this account.',
          disabled: wallet == null || wallet.type === 'locked',
        })}
        {makeMenuItem({
          onClick: onClickDeleteWallet,
          text: 'Close Wallet',
          tooltip:
            'Remove the currently selected account from browser local ' +
            'storage. This does not delete the address or the funds at the ' +
            'address, it only removes it from storage local to your computer.',
          disabled: account == null || !account.deletable,
        })}
      </Menu>
      {changeNameDialog}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  addShowSnackbarError,
  (withStateHandlers(
    () => ({
      anchorEl: null,
      open: false,
      openChangeName: false,
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ): $FlowFixMe),
  withHandlers({
    onClickMenu: ({ setState }) => (event) => {
      const anchorEl = event.currentTarget;
      setState((prevState) => ({
        ...prevState,
        open: true,
        anchorEl,
      }));
    },
    onCloseMenu: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        open: false,
      })),
    onClickChangeName: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        open: false,
        openChangeName: true,
      })),
    onCloseChangeNameDialog: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        openChangeName: false,
      })),
    onClickDeleteWallet: (options) => () => {
      const {
        account,
        setState,
        appContext,
        showSnackbarError,
      } = ((options: $FlowFixMe): {|
        account: UserAccount,
        setState: (state: any) => void,
        appContext: AppContext,
        showSnackbarError: (error: Error) => void,
      |});

      appContext.monitor
        .captureSpan(
          (span) =>
            walletAPI
              .deleteAccount({ appContext, id: account.id })
              .catch((error) => {
                span.logError({
                  name: 'neotracker_wallet_delete',
                  message: `Failed to delete wallet ${account.id.address}`,
                  error,
                });
                throw error;
              }),
          { name: 'neotracker_wallet_delete' },
        )
        .then(() => {
          setState((prevState) => ({
            ...prevState,
            open: false,
          }));
        })
        .catch((error) => {
          showSnackbarError(error);
        });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(SelectCardMenu): React.ComponentType<ExternalProps>);
