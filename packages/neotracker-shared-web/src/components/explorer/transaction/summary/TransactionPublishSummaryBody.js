/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import {
  ContractPublished,
  TransactionInputPagingTable,
  TransactionOutputPagingTable,
} from '../lib';

import { fragmentContainer } from '../../../../graphql/relay';

import { type TransactionPublishSummaryBody_transaction } from './__generated__/TransactionPublishSummaryBody_transaction.graphql';
import TransactionSplitSummaryBody from './TransactionSplitSummaryBody';

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionPublishSummaryBody_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionPublishSummaryBody({
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
  const published = <ContractPublished contract={transaction.contracts[0]} />;
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
      extraRight={published}
      dense={dense}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionPublishSummaryBody_transaction on Transaction {
        ...TransactionInputPagingTable_transaction
        ...TransactionOutputPagingTable_transaction
        contracts {
          edges {
            node {
              ...ContractPublished_contract
            }
          }
        }
      }
    `,
  }),
  pure,
);

export default (enhance(
  TransactionPublishSummaryBody,
): React.ComponentType<ExternalProps>);
