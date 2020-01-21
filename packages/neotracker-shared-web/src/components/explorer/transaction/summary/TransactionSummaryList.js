/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';
import { PageLoading } from '../../../common/loading';
import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer, getID } from '../../../../graphql/relay';

import TransactionSummary from './TransactionSummary';
import { type TransactionSummaryList_transactions } from './__generated__/TransactionSummaryList_transactions.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    summary: {
      marginTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    summary: {
      marginTop: theme.spacing.unit * 2,
    },
  },
  summary: {},
});

type ExternalProps = {|
  transactions: any,
  loading?: boolean,
  className?: string,
|};
type InternalProps = {|
  transactions: TransactionSummaryList_transactions,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSummaryList({
  transactions,
  loading,
  className,
  classes,
}: Props): React.Element<*> {
  let content = <PageLoading />;
  if (!loading) {
    content = transactions.map((transaction) => (
      <TransactionSummary
        key={getID(transaction.id)}
        className={classes.summary}
        transaction={transaction}
      />
    ));
  }

  return (
    <div className={className}>
      <div>
        <Typography variant="title">Transactions</Typography>
      </div>
      <div>{content}</div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transactions: graphql`
      fragment TransactionSummaryList_transactions on Transaction
        @relay(plural: true) {
        id
        ...TransactionSummary_transaction
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionSummaryList,
): React.ComponentType<ExternalProps>);
