/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AddressLink } from './lib';
import { Table } from '../../common/table';
import { TransactionTimeLink } from '../transaction/lib';

import { formatNumber } from '../../../utils';
import { fragmentContainer, getID } from '../../../graphql/relay';

import { type AddressTable_addresses } from './__generated__/AddressTable_addresses.graphql';

type ExternalProps = {|
  addresses: any,
  renderCoin: (hash: string) => React.Element<any>,
  getRowHeight?: (idx: number) => ?number,
  className?: string,
|};
type InternalProps = {|
  addresses: AddressTable_addresses,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressTable({
  addresses,
  renderCoin,
  getRowHeight,
  className,
}: Props): React.Element<*> {
  const addressValues = [];
  const createdAtValues = [];
  const lastTransactionValues = [];
  const transactionsValues = [];
  const coinValues = [];
  addresses.forEach((address) => {
    addressValues.push(<AddressLink addressHash={getID(address.id)} />);
    createdAtValues.push(
      <TransactionTimeLink
        transactionHash={address.transaction_hash}
        blockTime={address.block_time}
      />,
    );
    lastTransactionValues.push(
      <TransactionTimeLink
        transactionHash={address.last_transaction_hash}
        blockTime={address.last_transaction_time}
      />,
    );
    transactionsValues.push(formatNumber(address.transaction_count));
    coinValues.push(renderCoin(getID(address.id)));
  });
  const columns = [
    {
      name: 'Address',
      values: addressValues,
    },
    {
      name: 'Created',
      values: createdAtValues,
      visibleAt: 'sm',
    },
    {
      name: 'Last Transaction',
      values: lastTransactionValues,
      visibleAt: 'sm',
    },
    {
      name: 'Transactions',
      numeric: true,
      values: transactionsValues,
      visibleAt: 'xs',
    },
    {
      name: 'Coins',
      numeric: true,
      values: coinValues,
      minWidth: true,
    },
  ];
  return (
    <Table
      className={className}
      columns={columns}
      getRowHeight={getRowHeight}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    addresses: graphql`
      fragment AddressTable_addresses on Address @relay(plural: true) {
        id
        transaction_hash
        block_time
        last_transaction_hash
        last_transaction_time
        transaction_count
      }
    `,
  }),
  pure,
);

export default (enhance(AddressTable): React.ComponentType<ExternalProps>);
