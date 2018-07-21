/* @flow */
// $FlowFixMe
import { GAS_ASSET_HASH } from '@neotracker/shared-utils';
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AddressLink } from '../address/lib';
import { PageView } from '../../common/view';
import { TransactionTimeLink } from '../transaction/lib';

import { formatNumber } from '../../../utils';
import { fragmentContainer, getID } from '../../../graphql/relay';
import { getName } from './lib';
import * as routes from '../../../routes';

import { type AssetView_asset } from './__generated__/AssetView_asset.graphql';
import AssetViewExtra from './AssetViewExtra';

type ExternalProps = {|
  asset: any,
  className?: string,
|};
type InternalProps = {|
  asset: AssetView_asset,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetView({ asset, className }: Props): React.Element<*> {
  let supply = formatNumber(asset.amount);
  if (asset.type === 'NEP5') {
    supply = formatNumber(asset.issued);
  }
  const columns = [
    ['Hash', getID(asset.id)],
    ['Type', asset.type],
    ['Name', getName(asset.name, getID(asset.id))],
    ['Symbol', getName(asset.symbol, getID(asset.id))],
    ['Supply', supply],
    getID(asset.id) === GAS_ASSET_HASH
      ? ['Available', formatNumber(asset.available)]
      : null,
    ['Issued', formatNumber(asset.issued)],
    ['Precision', formatNumber(asset.precision)],
    asset.admin_address_id != null
      ? ['Owner', <AddressLink addressHash={asset.admin_address_id} />]
      : null,
    [
      'Created',
      <TransactionTimeLink
        transactionHash={asset.transaction_hash}
        blockTime={asset.block_time}
      />,
    ],
    ['Transactions', formatNumber(asset.transaction_count)],
    asset.type === 'NEP5'
      ? ['Transfers', formatNumber(asset.transfer_count)]
      : null,
    ['Addresses', formatNumber(asset.address_count)],
  ].filter(Boolean);

  return (
    <PageView
      className={className}
      id={getID(asset.id)}
      title="Asset"
      name="Asset"
      pluralName="Assets"
      searchRoute={routes.makeAssetSearch(1)}
      bodyColumns={columns}
      extra={<AssetViewExtra asset={asset} />}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    asset: graphql`
      fragment AssetView_asset on Asset {
        id
        transaction_hash
        type
        symbol
        name {
          lang
          name
        }
        amount
        issued
        available
        precision
        admin_address_id
        block_time
        transaction_count
        address_count
        transfer_count
        ...AssetViewExtra_asset
      }
    `,
  }),
  pure,
);

export default (enhance(AssetView): React.ComponentType<ExternalProps>);
