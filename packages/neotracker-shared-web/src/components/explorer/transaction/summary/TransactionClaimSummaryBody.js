/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import {
  TransactionClaimPagingTable,
  TransactionOutputPagingTable,
} from '../lib';

import { fragmentContainer } from '../../../../graphql/relay';

import { type TransactionClaimSummaryBody_transaction } from './__generated__/TransactionClaimSummaryBody_transaction.graphql';
import TransactionSplitSummaryBody from './TransactionSplitSummaryBody';

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionClaimSummaryBody_transaction,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionClaimSummaryBody({
  transaction,
  addressHash,
  dense,
  className,
}: Props): React.Element<*> | null {
  // TODO: Fix no claims/outputs
  const input = (
    <TransactionClaimPagingTable
      transaction={transaction}
      addressHash={addressHash}
      positive
    />
  );
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
      dense={dense}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionClaimSummaryBody_transaction on Transaction {
        ...TransactionClaimPagingTable_transaction
        ...TransactionOutputPagingTable_transaction
      }
    `,
  }),
  pure,
);

export default (enhance(
  TransactionClaimSummaryBody,
): React.ComponentType<ExternalProps>);
