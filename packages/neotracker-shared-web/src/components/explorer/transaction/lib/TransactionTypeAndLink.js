/* @flow */
import * as React from 'react';
import type { Variant } from '@material-ui/core/Typography';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';
import { Icon, Typography, withStyles } from '../../../../lib/base';
import Link from '../../../../lib/link/Link';

import { fragmentContainer } from '../../../../graphql/relay';
import * as routes from '../../../../routes';

import { type TransactionTypeAndLink_transaction } from './__generated__/TransactionTypeAndLink_transaction.graphql';

import getIcon from './getIcon';
import getTitle from './getTitle';

const styles = (theme: Theme) => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    minWidth: '148.63px',
  },
  title: {
    maxWidth: '76.63px',
    width: '76.63px',
    minWidth: '76.63px',
  },
  margin: {
    marginRight: theme.spacing.unit,
  },
});

type ExternalProps = {|
  transaction: any,
  titleComponent?: string,
  titleVariant?: Variant,
  hashComponent?: string,
  hashVariant?: Variant,
  className?: string,
|};
type InternalProps = {|
  transaction: TransactionTypeAndLink_transaction,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionTypeAndLink({
  transaction,
  titleComponent,
  titleVariant,
  hashComponent,
  hashVariant,
  className,
  classes,
}: Props): React.Element<*> {
  const icon = getIcon((transaction.type: any));
  const title = getTitle((transaction.type: any));
  return (
    <div className={classNames(classes.root, className)}>
      <Icon className={classes.margin}>{icon}</Icon>
      <Typography
        className={classNames(classes.title, classes.margin)}
        component={titleComponent}
        variant={titleVariant || 'subheading'}
      >
        {title}
      </Typography>
      <Link
        component={hashComponent}
        variant={hashVariant || 'body1'}
        path={routes.makeTransaction(transaction.hash)}
        title={transaction.hash}
      />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionTypeAndLink_transaction on Transaction {
        type
        hash
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TransactionTypeAndLink): React.ComponentType<
  ExternalProps,
>);
