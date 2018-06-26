/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AddressLink } from '../address/lib';
import { AssetNameLink } from '../asset/lib';
import { BlockTime } from '../block/lib';
import { TransferLink } from './lib';
import { Table } from '../../common/table';
import { TransactionValue } from '../transaction/lib';

import { fragmentContainer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type TransferTable_transfers } from './__generated__/TransferTable_transfers.graphql';

const styles = () => ({
  shrinkMaxCol: {
    flex: '1 100 auto',
    minWidth: 60,
  },
  shrinkCol: {
    flex: '1 10 auto',
  },
});

type ExternalProps = {|
  transfers: any,
  addressHash?: string,
  className?: string,
|};
type InternalProps = {|
  transfers: TransferTable_transfers,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransferTable({
  transfers,
  addressHash,
  className,
  classes,
}: Props): React.Element<*> {
  const transferValues = [];
  const fromValues = [];
  const toValues = [];
  const valueValues = [];
  const assetValues = [];
  const timeValues = [];
  transfers.forEach((transfer) => {
    transferValues.push(<TransferLink transfer={transfer} />);
    fromValues.push(
      transfer.from_address_id == null ? (
        <div />
      ) : (
        <AddressLink
          addressHash={transfer.from_address_id}
          highlighted={transfer.from_address_id === addressHash}
        />
      ),
    );
    toValues.push(
      transfer.to_address_id == null ? (
        <div />
      ) : (
        <AddressLink
          addressHash={transfer.to_address_id}
          highlighted={transfer.to_address_id === addressHash}
        />
      ),
    );
    valueValues.push(<TransactionValue value={transfer.value} />);
    assetValues.push(<AssetNameLink asset={transfer.asset} />);
    timeValues.push(<BlockTime blockTime={transfer.block_time} />);
  });
  const columns = [
    {
      name: 'Transfer',
      values: transferValues,
      className: classes.shrinkMaxCol,
    },
    {
      name: 'From',
      values: fromValues,
      className: classes.shrinkCol,
    },
    {
      name: 'To',
      values: toValues,
      className: classes.shrinkCol,
    },
    {
      name: 'Value',
      values: valueValues,
      numeric: true,
      minWidth: true,
    },
    {
      name: 'Asset',
      values: assetValues,
      minWidth: true,
    },
    {
      name: 'Time',
      values: timeValues,
      visibleAt: 'md',
      minWidth: true,
      numeric: true,
    },
  ];
  return <Table className={className} columns={columns} />;
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transfers: graphql`
      fragment TransferTable_transfers on Transfer @relay(plural: true) {
        ...TransferLink_transfer
        from_address_id
        to_address_id
        value
        asset {
          ...AssetNameLink_asset
        }
        block_time
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TransferTable): React.ComponentType<ExternalProps>);
