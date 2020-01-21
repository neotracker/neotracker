/* @flow */
import * as React from 'react';

import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import { graphql } from 'react-relay';

import { Collapse } from '../../../../lib/base';

import { fragmentContainer } from '../../../../graphql/relay';

import { type TransactionSummary_transaction } from './__generated__/TransactionSummary_transaction.graphql';
import TransactionSummaryBodyFooter from './TransactionSummaryBodyFooter';
import TransactionSummaryHeader from './TransactionSummaryHeader';

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  initialShowBody?: boolean,
  alwaysExpand?: boolean,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionSummary_transaction,
  showBody: boolean,
  onShowBody: () => void,
  onHideBody: () => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSummary({
  transaction,
  addressHash,
  alwaysExpand,
  dense,
  className,
  showBody,
  onShowBody,
  onHideBody,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      <TransactionSummaryHeader
        transaction={transaction}
        showBody={showBody}
        onShowBody={onShowBody}
        onHideBody={onHideBody}
        alwaysExpand={alwaysExpand}
      />
      <Collapse
        in={showBody || alwaysExpand || false}
        timeout="auto"
        unmountOnExit
      >
        <TransactionSummaryBodyFooter
          transactionHash={transaction.hash}
          addressHash={addressHash}
          dense={dense}
        />
      </Collapse>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionSummary_transaction on Transaction {
        hash
        ...TransactionSummaryHeader_transaction
      }
    `,
  }),
  withStateHandlers(
    ({ initialShowBody }) => ({
      showBody: initialShowBody || false,
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withHandlers({
    onShowBody: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        showBody: true,
      })),
    onHideBody: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        showBody: false,
      })),
  }),
  pure,
);

export default (enhance(
  TransactionSummary,
): React.ComponentType<ExternalProps>);
