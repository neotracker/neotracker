/* @flow */
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import { Link as RRLink } from 'react-router-dom';
import * as React from 'react';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
import type { UserAccount } from '@neo-one/client-common';
import type { LocalWallet } from '@neo-one/client-core';

import classNames from 'classnames';
import { graphql } from 'react-relay';

import type { AppContext } from '../../../AppContext';
import { Button, Card, Typography, withStyles } from '../../../lib/base';
import { Link } from '../../../lib/link';
import { AccountView } from '../account';
import { Selector } from '../../../lib/selector';
import { type Theme } from '../../../styles/createTheme';
import { Tooltip } from '../../../lib/tooltip';
import { WalletPageUpsell } from '../upsell';

import { addShowSnackbarError } from '../../../utils';
import { api as walletAPI } from '../../../wallet';
import * as routes from '../../../routes';
import { fragmentContainer } from '../../../graphql/relay';

import { type SelectCard_address } from './__generated__/SelectCard_address.graphql';
import SelectCardMenu from './SelectCardMenu';
import UnlockWallet from './UnlockWallet';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    header: {
      paddingLeft: theme.spacing.unit,
      paddingTop: theme.spacing.unit,
    },
    content: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    header: {
      paddingLeft: theme.spacing.unit * 2,
      paddingTop: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
    },
    content: {
      padding: theme.spacing.unit * 2,
    },
  },
  content: {},
  header: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  headerGroup: {
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
    flex: '1 1 auto',
    flexWrap: 'wrap',
  },
  selectorArea: {
    alignItems: 'center',
    display: 'flex',
    flex: '0 1 auto',
    height: 42,
    marginBottom: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 0,
  },
  buttonArea: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  title: {
    marginRight: theme.spacing.unit,
  },
  selector: {
    marginTop: theme.spacing.unit / 2,
    maxWidth: theme.spacing.unit * 50,
    minWidth: 0,
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
  buttonMargin: {
    marginBottom: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  link: {
    display: 'block',
    textDecoration: 'none',
  },
});

type ExternalProps = {|
  account: ?UserAccount,
  wallet: ?LocalWallet,
  address?: any,
  loading?: boolean,
  error?: ?Error,
  retry?: ?() => void,
  forward?: boolean,
  className?: string,
|};
type InternalProps = {|
  address: ?SelectCard_address,
  accounts: Array<UserAccount>,
  onSelect: (option: any) => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SelectCard({
  account,
  wallet,
  address,
  loading,
  error,
  retry,
  forward,
  className,
  accounts,
  onSelect,
  classes,
}: Props): React.Element<*> {
  const selector = (
    <div className={classes.selectorArea}>
      <Typography className={classes.title} variant="title" component="h1">
        Wallet
      </Typography>
      {accounts.length > 0 ? (
        <Selector
          className={classes.selector}
          id="select-account"
          selectText="Select Wallet"
          options={accounts.map((accountOption) => ({
            id: accountOption.id.address,
            text: accountOption.name,
            account: accountOption,
          }))}
          selectedID={account == null ? null : account.id.address}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  );

  const makeButton = ({
    path,
    onClick,
    text,
    tooltip,
  }: {
    // eslint-disable-next-line
    path?: string,
    // eslint-disable-next-line
    onClick?: () => void,
    text: string,
    tooltip: string,
  }) => {
    let button = (
      <Button
        className={classNames({
          [classes.buttonMargin]: path == null,
        })}
        variant="contained"
        color="primary"
        onClick={onClick}
      >
        <Typography className={classes.buttonText} variant="body1">
          {text}
        </Typography>
      </Button>
    );

    if (path != null) {
      button = (
        <RRLink
          className={classNames(classes.link, classes.buttonMargin)}
          to={path}
        >
          {button}
        </RRLink>
      );
    }

    return (
      <Tooltip title={tooltip} position="bottom">
        {button}
      </Tooltip>
    );
  };

  let content;
  if (account == null) {
    content = (
      <Typography className={classes.content} variant="body1">
        Open or create a account to view balance and claim GAS.
      </Typography>
    );
    if (forward) {
      content = <WalletPageUpsell className={classes.content} source="HOME" />;
    }
  } else {
    let unlock;
    if (wallet != null && wallet.type === 'locked') {
      unlock = <UnlockWallet wallet={wallet} forward={forward} />;
    }
    content = (
      <div>
        {unlock}
        <AccountView
          account={account}
          wallet={wallet}
          address={address}
          loading={loading}
          error={error}
          retry={retry}
          forward={forward}
        />
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className={classes.header}>
        <div className={classes.headerGroup}>
          {selector}
          <div className={classes.buttonArea}>
            {makeButton({
              path: routes.WALLET_NEW_WALLET,
              text: 'NEW WALLET',
              tooltip:
                'Generate a new private key and address in order to interact ' +
                'with the blockchain to receive NEO, GAS or other tokens, ' +
                'claim GAS and more.',
            })}
            {makeButton({
              path: routes.WALLET_OPEN_WALLET,
              text: 'OPEN WALLET',
              tooltip:
                'Open a account to interact with the blockchain in order to send ' +
                'NEO, GAS or other tokens, claim GAS and more.',
            })}
            <SelectCardMenu
              className={classes.buttonMargin}
              account={account}
              wallet={wallet}
            />
          </div>
        </div>
        <Link
          className={classes.buttonMargin}
          path={routes.WALLET_FAQ}
          title="FAQ"
          variant="subheading"
          component="p"
        />
      </div>
      {content}
    </Card>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  addShowSnackbarError,
  walletAPI.mapAccounts,
  withHandlers({
    onSelect: ({ appContext: appContextIn, showSnackbarError }) => (
      option: ?{ account: UserAccount },
    ) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      webLogger.info({ title: 'neotracker_wallet_select_account' });
      walletAPI
        .selectAccount({
          appContext,
          id: option == null ? undefined : option.account.id,
        })
        .catch((error) => {
          webLogger.error({ title: 'neotracker_wallet_select_account' });
          showSnackbarError(error);
        });
    },
  }),
  fragmentContainer({
    address: graphql`
      fragment SelectCard_address on Address {
        ...AccountView_address
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(SelectCard): React.ComponentType<ExternalProps>);
