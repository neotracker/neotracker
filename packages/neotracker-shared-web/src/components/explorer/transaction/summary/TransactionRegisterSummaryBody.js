/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import {
  AssetRegistered,
  TransactionInputPagingTable,
  TransactionOutputPagingTable,
} from '../lib';

import { fragmentContainer } from '../../../../graphql/relay';

import { type TransactionRegisterSummaryBody_transaction } from './__generated__/TransactionRegisterSummaryBody_transaction.graphql';
import TransactionSplitSummaryBody from './TransactionSplitSummaryBody';

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionRegisterSummaryBody_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionRegisterSummaryBody({
  transaction,
  addressHash,
  dense,
  className,
}: Props): React.Element<*> {
  const input = (
    <TransactionInputPagingTable
      transaction={transaction}
      addressHash={addressHash}
    />
  );
  const registered = <AssetRegistered asset={transaction.asset} />;
  const output = (
    <TransactionOutputPagingTable
      transaction={transaction}
      addressHash={addressHash}
    />
  );
  return (
    <TransactionSplitSummaryBody
      className={className}
      left={input}
      right={output}
      extraRight={registered}
      dense={dense}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionRegisterSummaryBody_transaction on Transaction {
        ...TransactionInputPagingTable_transaction
        ...TransactionOutputPagingTable_transaction
        asset {
          ...AssetRegistered_asset
        }
      }
    `,
  }),
  pure,
);

export default (enhance(
  TransactionRegisterSummaryBody,
): React.ComponentType<ExternalProps>);
