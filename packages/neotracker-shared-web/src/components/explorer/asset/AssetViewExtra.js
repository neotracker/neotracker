/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { ExpandoCard } from '../../common/card';
import { TransactionSummary } from '../transaction/summary';

import { fragmentContainer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type AssetViewExtra_asset } from './__generated__/AssetViewExtra_asset.graphql';
import AssetAddressPagingView from './AssetAddressPagingView';
import AssetTransactionPagingView from './AssetTransactionPagingView';
import AssetTransferPagingView from './AssetTransferPagingView';

const styles = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
});

type ExternalProps = {|
  asset: any,
  className?: string,
|};
type InternalProps = {|
  asset: AssetViewExtra_asset,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetViewExtra({
  asset,
  className,
  classes,
}: Props): React.Element<*> {
  const addresses = (
    <ExpandoCard
      title="Addresses"
      content={<AssetAddressPagingView asset={asset} />}
    />
  );

  const registerTransaction = (
    <ExpandoCard
      title="Registered"
      content={
        <TransactionSummary
          transaction={asset.register_transaction}
          alwaysExpand
        />
      }
    />
  );

  const transactions = (
    <ExpandoCard
      title="Transactions"
      content={<AssetTransactionPagingView asset={asset} />}
    />
  );

  let transfers;
  if (asset.type === 'NEP5') {
    transfers = (
      <ExpandoCard
        title="Transfers"
        content={<AssetTransferPagingView asset={asset} />}
      />
    );
  }

  return (
    <div className={classNames(className, classes.root)}>
      {registerTransaction}
      {addresses}
      {transactions}
      {transfers}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    asset: graphql`
      fragment AssetViewExtra_asset on Asset {
        type
        register_transaction {
          ...TransactionSummary_transaction
        }
        ...AssetTransactionPagingView_asset
        ...AssetTransferPagingView_asset
        ...AssetAddressPagingView_asset
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(AssetViewExtra): React.ComponentType<ExternalProps>);
