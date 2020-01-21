/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';
import { AddressLink } from '../../address/lib';
import {
  TransactionInputPagingTable,
  TransactionOutputPagingTable,
} from '../lib';
import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer, getID } from '../../../../graphql/relay';

import { type TransactionEnrollmentSummaryBody_transaction } from './__generated__/TransactionEnrollmentSummaryBody_transaction.graphql';
import TransactionSplitSummaryBody from './TransactionSplitSummaryBody';

const styles = (theme: Theme) => ({
  enrolledArea: {
    alignItems: 'center',
    display: 'flex',
    minWidth: '0',
  },
  enrolled: {
    marginRight: theme.spacing.unit,
  },
});

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionEnrollmentSummaryBody_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionEnrollmentSummaryBody({
  transaction,
  addressHash,
  dense,
  className,
  classes,
}: Props): React.Element<*> {
  const input = (
    <TransactionInputPagingTable
      transaction={transaction}
      addressHash={addressHash}
    />
  );
  let enrolled;
  if (transaction.enrollment != null) {
    enrolled = (
      <div className={classes.enrolledArea}>
        <Typography className={classes.enrolled} variant="body1">
          Validator Enrolled:
        </Typography>
        <AddressLink addressHash={getID(transaction.enrollment.address.id)} />
      </div>
    );
  }
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
      extraRight={enrolled}
      dense={dense}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionEnrollmentSummaryBody_transaction on Transaction {
        ...TransactionInputPagingTable_transaction
        ...TransactionOutputPagingTable_transaction
        enrollment {
          address {
            id
          }
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionEnrollmentSummaryBody,
): React.ComponentType<ExternalProps>);
