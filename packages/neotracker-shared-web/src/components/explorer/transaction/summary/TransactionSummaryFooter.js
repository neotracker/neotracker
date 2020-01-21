/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';
import { Typography, withStyles } from '../../../../lib/base';

import { formatNumber } from '../../../../utils';
import { fragmentContainer } from '../../../../graphql/relay';

import { type TransactionSummaryFooter_transaction } from './__generated__/TransactionSummaryFooter_transaction.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  root: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
  fee: {
    alignItems: 'center',
    display: 'flex',
  },
  margin: {
    marginRight: theme.spacing.unit,
  },
  font: {
    fontWeight: theme.typography.fontWeightMedium,
  },
});

type ExternalProps = {|
  transaction: any,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionSummaryFooter_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
// TODO: INTL
function TransactionSummaryFooter({
  transaction,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.fee}>
        <Typography
          className={classNames(classes.margin, classes.font)}
          variant="body1"
        >
          {`Network Fee: ${formatNumber(transaction.network_fee)} GAS`}
        </Typography>
        <Typography className={classes.font} variant="body1">
          {`System Fee: ${formatNumber(transaction.system_fee)} GAS`}
        </Typography>
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionSummaryFooter_transaction on Transaction {
        network_fee
        system_fee
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionSummaryFooter,
): React.ComponentType<ExternalProps>);
