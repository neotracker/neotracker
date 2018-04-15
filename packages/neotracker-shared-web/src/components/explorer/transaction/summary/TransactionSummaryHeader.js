/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';
import { BlockTime } from '../../block/lib';
import { Chevron } from '../../../../lib/animated';
import { IconButton, withStyles } from '../../../../lib/base';
import {
  TransactionHeaderBackground,
  TransactionTypeAndLink,
} from '../../transaction/lib';

import { fragmentContainer } from '../../../../graphql/relay';

import { type TransactionSummaryHeader_transaction } from './__generated__/TransactionSummaryHeader_transaction.graphql';

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
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
  leftHeader: {
    flex: '1 100 auto',
    marginRight: theme.spacing.unit,
    minWidth: 150,
  },
  rightHeader: {
    alignItems: 'center',
    display: 'flex',
    flex: '1 1 208px',
    justifyContent: 'flex-end',
    minWidth: '0',
  },
  // TODO: Keep in sync with ExpandoCard and/or extract out
  chevronButton: {
    width: theme.spacing.unit * 5,
    height: theme.spacing.unit * 5,
    marginBottom: -theme.spacing.unit,
    marginRight: -theme.spacing.unit,
    marginTop: -theme.spacing.unit,
  },
  blockTime: {
    marginRight: theme.spacing.unit,
  },
});

type ExternalProps = {|
  transaction: any,
  showBody: boolean,
  onShowBody: () => void,
  onHideBody: () => void,
  alwaysExpand?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionSummaryHeader_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSummaryHeader({
  transaction,
  showBody,
  onShowBody,
  onHideBody,
  alwaysExpand,
  className,
  classes,
}: Props): React.Element<*> {
  let chevron = null;
  let onClickChevron;
  if (!alwaysExpand) {
    onClickChevron = showBody ? onHideBody : onShowBody;
    chevron = (
      <IconButton className={classes.chevronButton} onClick={onClickChevron}>
        <Chevron up={!showBody} />
      </IconButton>
    );
  }
  return (
    <TransactionHeaderBackground
      className={classNames(classes.root, className)}
      transaction={transaction}
      onClick={onClickChevron}
    >
      <TransactionTypeAndLink
        className={classes.leftHeader}
        transaction={transaction}
      />
      <div className={classes.rightHeader}>
        <BlockTime
          className={classes.blockTime}
          blockTime={transaction.block_time}
        />
        {chevron}
      </div>
    </TransactionHeaderBackground>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionSummaryHeader_transaction on Transaction {
        ...TransactionHeaderBackground_transaction
        ...TransactionTypeAndLink_transaction
        type
        block_time
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TransactionSummaryHeader): React.ComponentType<
  ExternalProps,
>);
