/* @flow */
import * as React from 'react';
import type { LocalWallet, UserAccount } from '@neo-one/client';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import type { AppOptions } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';
import { CoinTable, CoinValue } from '../../explorer/address/lib';
import { Typography, withStyles } from '../../../lib/base';
import { WalletPageUpsell } from '../upsell';

import { fragmentContainer } from '../../../graphql/relay';
import { mapAppOptions } from '../../../utils';

import { type AccountViewBase_address } from './__generated__/AccountViewBase_address.graphql';

import ClaimGASButton from './ClaimGASButton';
import ClaimGASSteps from './ClaimGASSteps';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingBottom: theme.spacing.unit,
      paddingTop: theme.spacing.unit,
    },
    padding: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
    margin: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
    },
    marginLeft: {
      marginLeft: theme.spacing.unit,
    },
    marginTop: {
      marginTop: theme.spacing.unit,
    },
    table: {
      paddingBottom: theme.spacing.unit,
    },
    steps: {
      paddingTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      paddingBottom: theme.spacing.unit * 2,
      paddingTop: theme.spacing.unit * 2,
    },
    padding: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
    margin: {
      marginLeft: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit * 2,
    },
    marginLeft: {
      marginLeft: theme.spacing.unit * 2,
    },
    marginTop: {
      marginTop: theme.spacing.unit * 2,
    },
    table: {
      paddingBottom: theme.spacing.unit * 2,
    },
    steps: {
      paddingTop: theme.spacing.unit * 2,
    },
  },
  root: {},
  padding: {},
  margin: {},
  marginLeft: {},
  marginTop: {},
  table: {},
  steps: {},
  textColor: {
    color: theme.typography.body1.color,
  },
  unclaimed: {
    display: 'flex',
  },
  borderTop: {
    borderTop: `1px solid ${theme.custom.lightDivider}`,
  },
  claimArea: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  availableClaim: {
    marginRight: theme.spacing.unit / 2,
  },
  bottomElement: {
    paddingTop: theme.spacing.unit,
  },
  transferText: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  linkText: {
    display: 'inline',
  },
});

type ExternalProps = {|
  account: UserAccount,
  wallet: ?LocalWallet,
  address: any,
  forward?: boolean,
  onClaimConfirmed?: ?() => void,
  className?: string,
|};
type InternalProps = {|
  address: ?AccountViewBase_address,
  classes: Object,
  appOptions: AppOptions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AccountViewBase({
  account,
  wallet,
  address,
  forward,
  onClaimConfirmed,
  className,
  classes,
  appOptions,
}: Props): React.Element<*> {
  let confirmedCoins = [];
  let claimValueAvailable = '0';
  if (address != null) {
    confirmedCoins = address.coins.edges.map((edge) => edge.node);
    claimValueAvailable = address.claim_value_available_coin.value;
  }

  let forwardElement;
  if (forward) {
    forwardElement = (
      <div className={classNames(classes.marginTop, classes.borderTop)}>
        <WalletPageUpsell
          className={classNames(classes.marginLeft, classes.marginTop)}
          source="HOME"
        />
      </div>
    );
  }

  return (
    <div className={classNames(className, classes.root)}>
      <CoinTable
        className={classNames(classes.table, classes.margin)}
        coins={confirmedCoins}
        variant="display1"
        component="p"
        textClassName={classes.textColor}
      />
      <div className={classNames(classes.claimArea, classes.borderTop)}>
        <Typography
          className={classNames(
            classes.availableClaim,
            classes.marginLeft,
            classes.marginTop,
          )}
          variant="subheading"
          component="p"
        >
          GAS available to claim:
        </Typography>
        <CoinValue
          className={classNames(classes.marginTop)}
          variant="subheading"
          component="p"
          value={claimValueAvailable}
        />
        {appOptions.disableWalletModify ||
        (wallet != null && wallet.type === 'locked') ? null : (
          <ClaimGASButton
            className={classNames(classes.marginLeft, classes.marginTop)}
            account={account}
            onClaimConfirmed={onClaimConfirmed}
          />
        )}
      </div>
      <ClaimGASSteps
        className={classNames(classes.steps, classes.margin)}
        account={account}
      />
      {forwardElement}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment AccountViewBase_address on Address {
        coins {
          edges {
            node {
              ...CoinTable_coins
            }
          }
        }
        claim_value_available_coin {
          value
        }
      }
    `,
  }),
  mapAppOptions,
  withStyles(styles),
  pure,
);

export default (enhance(AccountViewBase): React.ComponentType<ExternalProps>);
