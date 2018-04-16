/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import { graphql } from 'react-relay';

import { AddressLink } from '../../address/lib';
import { AssetNameLink } from '../../asset/lib';
import { TransactionValue } from '../../transaction/lib';

import { fragmentContainer } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import { type TransferItem_transfer } from './__generated__/TransferItem_transfer.graphql';

const styles = () => ({});

type ExternalProps = {|
  transfer: any,
  addressHash?: string,
  className?: string,
|};
type InternalProps = {|
  transfer: TransferItem_transfer,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransferItem({
  transfer,
  addressHash,
  className,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      {transfer.from_address_hash == null ? null : (
        <AddressLink
          addressHash={transfer.from_address_hash}
          highlighted={transfer.from_address_hash === addressHash}
        />
      )}
      {transfer.to_address_hash == null ? null : (
        <AddressLink
          addressHash={transfer.to_address_hash}
          highlighted={transfer.to_address_hash === addressHash}
        />
      )}
      <AssetNameLink asset={transfer.asset} />
      <TransactionValue negative={false} value={transfer.value} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transfer: graphql`
      fragment TransferItem_transfer on Transfer {
        from_address_hash
        to_address_hash
        value
        asset {
          ...AssetNameLink_asset
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TransferItem): React.ComponentType<ExternalProps>);
