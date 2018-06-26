/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { COIN_TABLE_ROW_HEIGHT } from './lib/CoinTable';
import { ZERO_GAS_COIN, Coin, CoinTable, getSortedCoins } from './lib';
import { PageView } from '../../common/view';
import { TransactionTimeLink } from '../transaction/lib';
import { WalletPageUpsell } from '../../wallet/upsell';

import { formatNumber } from '../../../utils';
import { fragmentContainer } from '../../../graphql/relay';
import * as routes from '../../../routes';
import { withStyles } from '../../../lib/base';

import { type AddressView_address } from './__generated__/AddressView_address.graphql';
import AddressViewExtra from './AddressViewExtra';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    upsell: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    upsell: {
      padding: theme.spacing.unit * 2,
    },
  },
  upsell: {
    borderTop: `1px solid ${theme.custom.lightDivider}`,
  },
});

type ExternalProps = {|
  hash: string,
  address: any,
  className?: string,
|};
type InternalProps = {|
  address: ?AddressView_address,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressView({
  hash,
  address,
  className,
  classes,
}: Props): React.Element<*> {
  const coins =
    address == null ? [] : address.coins.edges.map((edge) => edge.node);
  const sortedCoins = getSortedCoins(coins);
  const unclaimed =
    address == null ? ZERO_GAS_COIN : address.claim_value_available_coin;

  const columns = [
    ['Hash', hash],
    [
      'Balance',
      <CoinTable coins={coins} />,
      sortedCoins.length * COIN_TABLE_ROW_HEIGHT,
    ],
    ['Unclaimed', <Coin coin={unclaimed} />],
  ];
  if (address != null) {
    columns.push([
      'Created',
      <TransactionTimeLink
        transactionHash={address.transaction_hash}
        blockTime={address.block_time}
      />,
    ]);
  }
  columns.push([
    'Transactions',
    formatNumber(address == null ? 0 : address.transaction_count),
  ]);
  columns.push([
    'Transfers',
    formatNumber(address == null ? 0 : address.transfer_count),
  ]);

  return (
    <PageView
      className={className}
      id={hash}
      title="Address"
      name="Address"
      pluralName="Addresses"
      searchRoute={routes.makeAddressSearch(1)}
      bodyColumns={columns}
      extraCard={
        <WalletPageUpsell className={classes.upsell} source="ADDRESS" />
      }
      extra={<AddressViewExtra address={address} />}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment AddressView_address on Address {
        ...AddressViewExtra_address
        transaction_hash
        block_time
        transaction_count
        transfer_count
        coins {
          edges {
            node {
              ...CoinTable_coins
              value
              asset {
                id
                symbol
              }
            }
          }
        }
        claim_value_available_coin {
          ...Coin_coin
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(AddressView): React.ComponentType<ExternalProps>);
