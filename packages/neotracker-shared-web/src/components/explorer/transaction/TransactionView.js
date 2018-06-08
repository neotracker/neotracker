/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { BlockIndexLink, BlockTime, getBlockSize } from '../block/lib';
import { PageView } from '../../common/view';
import { WalletPageUpsell } from '../../wallet/upsell';

import { formatNumber } from '../../../utils';
import { fragmentContainer } from '../../../graphql/relay';
import {
  getBackgroundClassName,
  styles as bgStyles,
} from '../transaction/lib/TransactionHeaderBackground';
import { getIcon, getTitle } from '../transaction/lib';
import * as routes from '../../../routes';
import { withStyles } from '../../../lib/base';

import TransactionSummaryBody from './summary/TransactionSummaryBody';
import { type TransactionView_transaction } from './__generated__/TransactionView_transaction.graphql';
import TransactionViewExtra from './TransactionViewExtra';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    upsell: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    upsell: {
      padding: theme.spacing.unit * 2,
    },
  },
  upsell: {},
  extraCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  summary: {
    borderTop: `1px solid ${theme.custom.lightDivider}`,
  },
  ...bgStyles(theme),
});

type ExternalProps = {|
  transaction: any,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionView_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionView({
  transaction,
  className,
  classes,
}: Props): React.Element<*> {
  const columns = [
    ['Hash', transaction.hash],
    ['Time', <BlockTime blockTime={transaction.block_time} />],
    ['Network Fee', `${formatNumber(transaction.network_fee)} GAS`],
    ['System Fee', `${formatNumber(transaction.system_fee)} GAS`],
    ['Size', getBlockSize(transaction.size)],
    ['Block', <BlockIndexLink blockIndex={transaction.block_id} />],
  ];

  return (
    <PageView
      className={className}
      id={transaction.hash}
      title={getTitle((transaction.type: any))}
      name="Transaction"
      pluralName="Transactions"
      searchRoute={routes.makeTransactionSearch(1)}
      headerIcon={getIcon((transaction.type: any))}
      headerBackgroundColorClassName={getBackgroundClassName(
        classes,
        (transaction.type: any),
      )}
      bodyColumns={columns}
      extraCard={
        <div className={classes.extraCard}>
          <TransactionSummaryBody
            className={classes.summary}
            transaction={transaction}
          />
          <WalletPageUpsell className={classes.upsell} source="TRANSACTION" />
        </div>
      }
      extra={<TransactionViewExtra transaction={transaction} />}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionView_transaction on Transaction {
        ...TransactionSummaryBody_transaction
        type
        hash
        network_fee
        system_fee
        size
        block_time
        block_id
        ...TransactionViewExtra_transaction
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TransactionView): React.ComponentType<ExternalProps>);
