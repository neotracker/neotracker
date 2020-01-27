/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { ErrorView } from '../../../common/error';
import { PageLoading } from '../../../common/loading';

import { type Theme } from '../../../../styles/createTheme';
import { queryRenderer } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import TransactionSummaryBody from './TransactionSummaryBody';
import { type TransactionSummaryBodyFooterQueryResponse } from './__generated__/TransactionSummaryBodyFooterQuery.graphql';
import TransactionSummaryFooter from './TransactionSummaryFooter';

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
  border: {
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
  },
});

type ExternalProps = {|
  transactionHash: string,
  addressHash?: string,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  props: ?TransactionSummaryBodyFooterQueryResponse,
  error: ?Error,
  retry: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSummaryBodyFooter({
  addressHash,
  dense,
  props,
  error,
  retry,
  className,
  classes,
}: Props): React.Element<any> {
  const errorView = (
    <ErrorView
      className={classes.border}
      error={error}
      retry={retry}
      allowRetry
    />
  );
  if (error != null) {
    return errorView;
  }

  if (props == null) {
    return (
      <PageLoading
        className={classNames(classes.border, classes.padding)}
        disablePadding
      />
    );
  }

  const { transaction } = props;
  if (transaction == null) {
    return errorView;
  }

  return (
    <div className={className}>
      <TransactionSummaryBody
        transaction={transaction}
        addressHash={addressHash}
        dense={dense}
      />
      <TransactionSummaryFooter transaction={transaction} />
    </div>
  );
}

const mapPropsToVariables = ({ transactionHash }) => ({
  hash: transactionHash,
});
const enhance: HOC<*, *> = compose(
  queryRenderer(
    graphql`
      query TransactionSummaryBodyFooterQuery($hash: String!) {
        transaction(hash: $hash) {
          ...TransactionSummaryBody_transaction
          ...TransactionSummaryFooter_transaction
        }
      }
    `,
    {
      mapPropsToVariables: {
        client: mapPropsToVariables,
      },
    },
  ),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionSummaryBodyFooter,
): React.ComponentType<ExternalProps>);
