/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';

import { fragmentContainer } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import TransactionClaimSummaryBody from './TransactionClaimSummaryBody';
import TransactionEnrollmentSummaryBody from './TransactionEnrollmentSummaryBody';
import TransactionInputOutputSummaryBody from './TransactionInputOutputSummaryBody';
import TransactionInvocationSummaryBody from './TransactionInvocationSummaryBody';
import TransactionPublishSummaryBody from './TransactionPublishSummaryBody';
import TransactionRegisterSummaryBody from './TransactionRegisterSummaryBody';
import { type TransactionSummaryBody_transaction } from './__generated__/TransactionSummaryBody_transaction.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      padding: theme.spacing.unit * 2,
    },
  },
  root: {
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
  },
});

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionSummaryBody_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSummaryBody({
  transaction,
  addressHash,
  dense,
  className,
  classes,
}: Props): React.Element<any> | null {
  const rootClassName = classNames(classes.root, className);
  // $FlowFixMe
  const type = (transaction.type: TransactionType);
  const inputOutputSummary = (
    <TransactionInputOutputSummaryBody
      className={rootClassName}
      transaction={transaction}
      addressHash={addressHash}
      dense={dense}
    />
  );

  switch (type) {
    case 'MinerTransaction':
      return inputOutputSummary;
    case 'IssueTransaction':
      return inputOutputSummary;
    case 'ClaimTransaction':
      return (
        <TransactionClaimSummaryBody
          className={rootClassName}
          transaction={transaction}
          addressHash={addressHash}
          dense={dense}
        />
      );
    case 'EnrollmentTransaction':
      return (
        <TransactionEnrollmentSummaryBody
          className={rootClassName}
          transaction={transaction}
          addressHash={addressHash}
          dense={dense}
        />
      );
    case 'RegisterTransaction':
      return (
        <TransactionRegisterSummaryBody
          className={rootClassName}
          transaction={transaction}
          addressHash={addressHash}
          dense={dense}
        />
      );
    case 'ContractTransaction':
      return inputOutputSummary;
    case 'PublishTransaction':
      return (
        <TransactionPublishSummaryBody
          className={rootClassName}
          transaction={transaction}
          addressHash={addressHash}
          dense={dense}
        />
      );
    case 'InvocationTransaction':
      return (
        <TransactionInvocationSummaryBody
          className={rootClassName}
          transaction={transaction}
          addressHash={addressHash}
          dense={dense}
        />
      );
    default:
      // eslint-disable-next-line
      (type: empty);
      return null;
  }
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionSummaryBody_transaction on Transaction {
        type
        ...TransactionClaimSummaryBody_transaction
        ...TransactionEnrollmentSummaryBody_transaction
        ...TransactionInputOutputSummaryBody_transaction
        ...TransactionPublishSummaryBody_transaction
        ...TransactionRegisterSummaryBody_transaction
        ...TransactionInvocationSummaryBody_transaction
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionSummaryBody,
): React.ComponentType<ExternalProps>);
