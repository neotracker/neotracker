/* @flow */
/* eslint-disable react/no-array-index-key */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { ExpandoCard } from '../../common/card';
import { Script } from '../script';

import { fragmentContainer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type TransactionViewExtra_transaction } from './__generated__/TransactionViewExtra_transaction.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    padding: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    padding: {
      padding: theme.spacing.unit * 2,
    },
  },
  padding: {},
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
});

type ExternalProps = {|
  transaction: any,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionViewExtra_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionViewExtra({
  transaction,
  className,
  classes,
}: Props): React.Element<*> {
  // TODO: These should be right after one another, not split into 2 sections
  const elements = [];
  transaction.scripts.forEach((script, idx) => {
    elements.push(
      <ExpandoCard
        key={`invocation:${idx}`}
        title="Invocation Script"
        content={
          <Script
            className={classes.padding}
            script={script.invocation_script}
          />
        }
      />,
    );
  });
  transaction.scripts.forEach((script, idx) => {
    elements.push(
      <ExpandoCard
        key={`verification:${idx}`}
        title="Verification Script"
        content={
          <Script
            className={classes.padding}
            script={script.verification_script}
          />
        }
      />,
    );
  });

  if (
    transaction.type === 'InvocationTransaction' &&
    transaction.script != null
  ) {
    elements.push(
      <ExpandoCard
        key="script"
        title="Script"
        content={
          <Script className={classes.padding} script={transaction.script} />
        }
      />,
    );
  }

  return <div className={classNames(className, classes.root)}>{elements}</div>;
}

// TODO: Should transfers be ordered?
const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionViewExtra_transaction on Transaction {
        type
        scripts {
          invocation_script
          verification_script
        }
        script
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionViewExtra,
): React.ComponentType<ExternalProps>);
