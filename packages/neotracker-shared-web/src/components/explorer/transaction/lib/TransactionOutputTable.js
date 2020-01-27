/* @flow */
/* eslint-disable react/no-array-index-key */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';
import { IconLink } from '../../../../lib/link';
import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer } from '../../../../graphql/relay';
import * as routes from '../../../../routes';

import { type TransactionOutputTable_outputs } from './__generated__/TransactionOutputTable_outputs.graphql';
import TransactionInputOutputTable from './TransactionInputOutputTable';

const styles = (theme: Theme) => ({
  spent: {
    color: theme.custom.colors.red[500],
    marginRight: theme.spacing.unit,
  },
  spentArea: {
    alignItems: 'center',
    display: 'flex',
  },
  row: theme.custom.inputOutput.row,
});

type ExternalProps = {|
  outputs: any,
  transfers?: Array<{|
    +address_id: string,
    +value: string,
    +asset: any,
  |}>,
  addressHash?: string,
  page: number,
  isInitialLoad: boolean,
  isLoadingMore: boolean,
  error: ?string,
  pageSize: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
  onUpdatePage: (page: number) => void,
  className?: string,
|};
type InternalProps = {|
  outputs: TransactionOutputTable_outputs,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
// TODO: INTL
function TransactionOutputTable({
  outputs,
  transfers = [],
  addressHash,
  page,
  isInitialLoad,
  isLoadingMore,
  error,
  pageSize,
  hasPreviousPage,
  hasNextPage,
  onUpdatePage,
  className,
  classes,
}: Props): React.Element<*> {
  const links = outputs.map((output, idx) => {
    let link = (
      <Typography
        key={idx + transfers.length}
        variant="body1"
        className={classes.row}
      >
        (Unspent)
      </Typography>
    );
    if (output.input_transaction_hash != null) {
      link = (
        <div
          key={idx + transfers.length}
          className={classNames(classes.spentArea, classes.row)}
        >
          <Typography variant="body1" className={classes.spent}>
            (Spent)
          </Typography>
          <IconLink
            key={idx}
            icon="arrow_forward"
            path={routes.makeTransaction(output.input_transaction_hash)}
          />
        </div>
      );
    }
    return link;
  });
  const transferLinks = transfers.map((transfer, idx) => (
    <Typography key={idx} variant="body1" className={classes.row} />
  ));
  return (
    <TransactionInputOutputTable
      className={className}
      input_outputs={outputs}
      transfers={transfers}
      right={transferLinks.concat(links)}
      addressHash={addressHash}
      positive
      page={page}
      isInitialLoad={isInitialLoad}
      isLoadingMore={isLoadingMore}
      error={error}
      pageSize={pageSize}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      onUpdatePage={onUpdatePage}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    outputs: graphql`
      fragment TransactionOutputTable_outputs on TransactionInputOutput
        @relay(plural: true) {
        ...TransactionInputOutputTable_input_outputs
        input_transaction_hash
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionOutputTable,
): React.ComponentType<ExternalProps>);
