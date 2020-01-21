/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import { graphql } from 'react-relay';

import {
  AssetRegistered,
  ContractPublished,
  // TransactionActionPagingTable,
  TransactionInputPagingTable,
  TransactionOutputPagingTable,
} from '../lib';

import { fragmentContainer, getID } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import { type TransactionInvocationSummaryBody_transaction } from './__generated__/TransactionInvocationSummaryBody_transaction.graphql';
import TransactionSplitSummaryBody from './TransactionSplitSummaryBody';

const styles = () => ({
  extra: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: '0',
  },
});

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionInvocationSummaryBody_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionInvocationSummaryBody({
  transaction,
  addressHash,
  dense,
  className,
  classes,
}: Props): React.Element<*> {
  const transfers = transaction.transfers.edges.map(
    (transfer) => transfer.node,
  );

  const input = (
    <TransactionInputPagingTable
      transaction={transaction}
      addressHash={addressHash}
      transfers={transfers}
      offset={transfers.length}
    />
  );

  const published = [];
  for (const edge of transaction.contracts.edges) {
    published.push(
      <ContractPublished key={getID(edge.node.id)} contract={edge.node} />,
    );
  }

  let registered;
  if (transaction.asset != null) {
    registered = <AssetRegistered asset={transaction.asset} />;
  }

  const extra = (
    <div className={classes.extra}>
      {registered}
      {published}
    </div>
  );

  const output = (
    <TransactionOutputPagingTable
      transaction={transaction}
      addressHash={addressHash}
      transfers={transfers}
      offset={transfers.length}
    />
  );

  return (
    <div className={classNames(className, classes.root)}>
      <TransactionSplitSummaryBody
        left={input}
        right={output}
        extraRight={extra}
        dense={dense}
      />
    </div>
  );
}

/*
<TransactionActionPagingTable
  transaction={transaction}
  addressHash={addressHash}
/>
*/
// TODO: Add support for actions
// ...TransactionActionPagingTable_transaction
const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionInvocationSummaryBody_transaction on Transaction {
        ...TransactionInputPagingTable_transaction
        ...TransactionOutputPagingTable_transaction
        asset {
          ...AssetRegistered_asset
        }
        transfers {
          edges {
            node {
              asset {
                ...AssetNameLink_asset
              }
              from_address_id
              to_address_id
              value
            }
          }
        }
        contracts {
          edges {
            node {
              id
              ...ContractPublished_contract
            }
          }
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionInvocationSummaryBody,
): React.ComponentType<ExternalProps>);
