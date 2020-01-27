/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import {
  TransactionInputPagingTable,
  TransactionOutputPagingTable,
} from '../lib';

import { fragmentContainer } from '../../../../graphql/relay';

import { type TransactionInputOutputSummaryBody_transaction } from './__generated__/TransactionInputOutputSummaryBody_transaction.graphql';
import TransactionSplitSummaryBody from './TransactionSplitSummaryBody';

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionInputOutputSummaryBody_transaction,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionInputOutputSummaryBody({
  transaction,
  addressHash,
  dense,
  className,
}: Props): React.Element<*> | null {
  // TODO: empty edges
  const input = (
    <TransactionInputPagingTable
      transaction={transaction}
      addressHash={addressHash}
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
      fragment TransactionInputOutputSummaryBody_transaction on Transaction {
        ...TransactionInputPagingTable_transaction
        ...TransactionOutputPagingTable_transaction
      }
    `,
  }),
  pure,
);

export default (enhance(
  TransactionInputOutputSummaryBody,
): React.ComponentType<ExternalProps>);
