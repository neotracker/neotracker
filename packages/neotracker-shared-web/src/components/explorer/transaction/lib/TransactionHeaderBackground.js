/* @flow */
import * as React from 'react';
import type { Transaction } from '@neo-one/client';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';

import { fragmentContainer } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import { type TransactionHeaderBackground_transaction } from './__generated__/TransactionHeaderBackground_transaction.graphql';

export const styles = (theme: Theme) => ({
  contract: {
    borderLeft: `2px solid ${theme.custom.transactionColors.contract.backgroundColor}`,
  },
  miner: {
    borderLeft: `2px solid ${theme.custom.transactionColors.miner.backgroundColor}`,
  },
  issue: {
    borderLeft: `2px solid ${theme.custom.transactionColors.issue.backgroundColor}`,
  },
  claim: {
    borderLeft: `2px solid ${theme.custom.transactionColors.claim.backgroundColor}`,
  },
  enrollment: {
    borderLeft: `2px solid ${theme.custom.transactionColors.enrollment.backgroundColor}`,
  },
  register: {
    borderLeft: `2px solid ${theme.custom.transactionColors.register.backgroundColor}`,
  },
  publish: {
    borderLeft: `2px solid ${theme.custom.transactionColors.publish.backgroundColor}`,
  },
  invocation: {
    borderLeft: `2px solid ${theme.custom.transactionColors.invocation.backgroundColor}`,
  },
  state: {
    borderLeft: `2px solid ${theme.custom.transactionColors.state.backgroundColor}`,
  },
  contractBG: {
    backgroundColor: theme.custom.transactionColors.contract.backgroundColor,
  },
  minerBG: {
    backgroundColor: theme.custom.transactionColors.miner.backgroundColor,
  },
  issueBG: {
    backgroundColor: theme.custom.transactionColors.issue.backgroundColor,
  },
  claimBG: {
    backgroundColor: theme.custom.transactionColors.claim.backgroundColor,
  },
  enrollmentBG: {
    backgroundColor: theme.custom.transactionColors.enrollment.backgroundColor,
  },
  registerBG: {
    backgroundColor: theme.custom.transactionColors.register.backgroundColor,
  },
  publishBG: {
    backgroundColor: theme.custom.transactionColors.publish.backgroundColor,
  },
  invocationBG: {
    backgroundColor: theme.custom.transactionColors.invocation.backgroundColor,
  },
  stateBG: {
    backgroundColor: theme.custom.transactionColors.state.backgroundColor,
  },
  pointer: {
    cursor: 'pointer',
  },
});

export const getBackgroundClassName = (
  classes: Object,
  type: $PropertyType<Transaction, 'type'>,
) => {
  let bgColorClass;
  switch (type) {
    case 'MinerTransaction':
      bgColorClass = classes.minerBG;
      break;
    case 'IssueTransaction':
      bgColorClass = classes.issueBG;
      break;
    case 'ClaimTransaction':
      bgColorClass = classes.claimBG;
      break;
    case 'EnrollmentTransaction':
      bgColorClass = classes.enrollmentBG;
      break;
    case 'RegisterTransaction':
      bgColorClass = classes.registerBG;
      break;
    case 'ContractTransaction':
      bgColorClass = classes.contractBG;
      break;
    case 'PublishTransaction':
      bgColorClass = classes.publishBG;
      break;
    case 'InvocationTransaction':
      bgColorClass = classes.invocationBG;
      break;
    case 'StateTransaction':
      bgColorClass = classes.stateBG;
      break;
    default:
      // eslint-disable-next-line
      (type: empty);
      break;
  }
  return bgColorClass;
};

const getBorderClassName = (
  classes: Object,
  type: $PropertyType<Transaction, 'type'>,
) => {
  let borderClass;
  switch (type) {
    case 'MinerTransaction':
      borderClass = classes.miner;
      break;
    case 'IssueTransaction':
      borderClass = classes.issue;
      break;
    case 'ClaimTransaction':
      borderClass = classes.claim;
      break;
    case 'EnrollmentTransaction':
      borderClass = classes.enrollment;
      break;
    case 'RegisterTransaction':
      borderClass = classes.register;
      break;
    case 'ContractTransaction':
      borderClass = classes.contract;
      break;
    case 'PublishTransaction':
      borderClass = classes.publish;
      break;
    case 'InvocationTransaction':
      borderClass = classes.invocation;
      break;
    case 'StateTransaction':
      borderClass = classes.state;
      break;
    default:
      // eslint-disable-next-line
      (type: empty);
      break;
  }
  return borderClass;
};

type ExternalProps = {|
  transaction: any,
  onClick?: () => void,
  children?: any,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionHeaderBackground_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionHeaderBackground({
  transaction,
  onClick,
  children,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div
      role="presentation"
      className={classNames(
        getBorderClassName(classes, (transaction.type: any)),
        className,
        {
          [classes.pointer]: onClick != null,
        },
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionHeaderBackground_transaction on Transaction {
        type
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionHeaderBackground,
): React.ComponentType<ExternalProps>);
