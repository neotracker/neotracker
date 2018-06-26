/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AssetNameLink } from './lib';
import { Table } from '../../common/table';
import { TransactionTimeLink } from '../transaction/lib';

import { formatNumber } from '../../../utils';
import { fragmentContainer } from '../../../graphql/relay';

import { type AssetTable_assets } from './__generated__/AssetTable_assets.graphql';

type ExternalProps = {|
  assets: any,
  className?: string,
|};
type InternalProps = {|
  assets: AssetTable_assets,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetTable({ assets, className }: Props): React.Element<*> {
  const assetValues = [];
  const typeValues = [];
  const supplyValues = [];
  const issuedValues = [];
  const addressCountValues = [];
  const transactionCountValues = [];
  const registeredAt = [];
  assets.forEach((asset) => {
    let supply =
      asset.amount === '-0.00000001' ? 'Unlimited' : formatNumber(asset.amount);
    if (asset.type === 'NEP5') {
      supply = formatNumber(asset.issued);
    }

    assetValues.push(<AssetNameLink asset={asset} />);
    typeValues.push(asset.type);
    supplyValues.push(supply);
    issuedValues.push(formatNumber(asset.issued));
    addressCountValues.push(formatNumber(asset.address_count));
    transactionCountValues.push(formatNumber(asset.transaction_count));
    registeredAt.push(
      <TransactionTimeLink
        transactionHash={asset.transaction_hash}
        blockTime={asset.block_time}
      />,
    );
  });
  const columns = [
    {
      name: 'Asset',
      values: assetValues,
    },
    {
      name: 'Type',
      values: typeValues,
    },
    {
      name: 'Supply',
      numeric: true,
      values: supplyValues,
      visibleAt: 'sm',
      minWidth: true,
    },
    {
      name: 'Issued',
      numeric: true,
      values: issuedValues,
      visibleAt: 'sm',
      minWidth: true,
    },
    {
      name: 'Addresses',
      numeric: true,
      values: addressCountValues,
      visibleAt: 'xs',
    },
    {
      name: 'Transactions',
      numeric: true,
      values: transactionCountValues,
    },
    {
      name: 'Registered',
      values: registeredAt,
      visibleAt: 'md',
    },
  ];
  return <Table className={className} columns={columns} />;
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    assets: graphql`
      fragment AssetTable_assets on Asset @relay(plural: true) {
        ...AssetNameLink_asset
        type
        amount
        issued
        transaction_hash
        block_time
        address_count
        transaction_count
      }
    `,
  }),
  pure,
);

export default (enhance(AssetTable): React.ComponentType<ExternalProps>);
