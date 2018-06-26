/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { TransactionSummary } from './summary';

import { fragmentContainer, getID } from '../../../graphql/relay';

import { type TransactionTable_transactions } from './__generated__/TransactionTable_transactions.graphql';

type ExternalProps = {|
  transactions: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transactions: TransactionTable_transactions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionTable({
  transactions,
  addressHash,
  dense,
  className,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      {transactions.map((transaction) => (
        <TransactionSummary
          key={getID(transaction.id)}
          transaction={transaction}
          addressHash={addressHash}
          dense={dense}
        />
      ))}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transactions: graphql`
      fragment TransactionTable_transactions on Transaction
        @relay(plural: true) {
        id
        ...TransactionSummary_transaction
      }
    `,
  }),
  pure,
);

export default (enhance(TransactionTable): React.ComponentType<ExternalProps>);
