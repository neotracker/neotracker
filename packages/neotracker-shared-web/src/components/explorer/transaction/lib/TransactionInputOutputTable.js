/* @flow */
/* eslint-disable react/no-array-index-key */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AddressLink } from '../../address/lib';
import { type Theme } from '../../../../styles/createTheme';
import { AssetNameLink } from '../../asset/lib';
import { PagingView } from '../../../common/view';

import { fragmentContainer } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import { type TransactionInputOutputTable_input_outputs } from './__generated__/TransactionInputOutputTable_input_outputs.graphql';
import TransactionValue from './TransactionValue';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    maxWidth: '100%',
    minWidth: '0',
  },
  contentRoot: {
    display: 'flex',
    flex: '0 1 auto',
    maxWidth: '100%',
    minWidth: '0',
  },
  rightRoot: {
    alignItems: 'flex-end',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  margin: {
    marginRight: theme.spacing.unit,
  },
  value: {
    marginRight: theme.spacing.unit / 2,
    justifyContent: 'flex-end',
  },
  row: theme.custom.inputOutput.row,
  addressCol: {
    flex: '0 1 auto',
    minWidth: theme.spacing.unit * 4,
  },
  valueCol: {
    flex: '0 0 auto',
  },
  assetCol: {
    flex: '0 1 auto',
    minWidth: 36,
  },
  leftCol: {
    flex: '0 0 auto',
  },
  rightCol: {
    flex: '0 0 auto',
  },
});

type ExternalProps = {|
  input_outputs: any,
  left?: any,
  right?: any,
  addressHash?: string,
  positive?: boolean,
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
  input_outputs: TransactionInputOutputTable_input_outputs,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionInputOutputTable({
  input_outputs,
  left,
  right,
  addressHash,
  positive,
  className,
  page,
  isInitialLoad,
  isLoadingMore,
  error,
  pageSize,
  hasPreviousPage,
  hasNextPage,
  onUpdatePage,
  classes,
}: Props): React.Element<*> {
  const addressLinks = [];
  const values = [];
  const assets = [];
  input_outputs.forEach((inputOutput, idx) => {
    addressLinks.push(
      <div key={idx} className={classNames(classes.margin, classes.row)}>
        <AddressLink
          addressHash={inputOutput.address_hash}
          highlighted={inputOutput.address_hash === addressHash}
        />
      </div>,
    );
    values.push(
      <TransactionValue
        key={idx}
        negative={!positive}
        className={classNames(classes.row, classes.value)}
        value={inputOutput.value}
      />,
    );
    assets.push(
      <AssetNameLink
        key={idx}
        className={classNames(
          right == null ? undefined : classes.margin,
          classes.row,
        )}
        asset={inputOutput.asset}
      />,
    );
  });
  const content = (
    <div className={classes.contentRoot}>
      {left == null ? null : (
        <div className={classNames(classes.col, classes.leftCol)}>{left}</div>
      )}
      <div className={classNames(classes.col, classes.addressCol)}>
        {addressLinks}
      </div>
      <div className={classNames(classes.col, classes.valueCol)}>{values}</div>
      <div className={classNames(classes.col, classes.assetCol)}>{assets}</div>
      {right == null ? null : (
        <div className={classNames(classes.col, classes.rightCol)}>{right}</div>
      )}
    </div>
  );
  return (
    <PagingView
      className={classNames(
        {
          [classes.rightRoot]: right != null,
        },
        className,
        classes.root,
      )}
      content={content}
      isInitialLoad={isInitialLoad}
      isLoadingMore={isLoadingMore}
      page={page}
      pageSize={pageSize}
      currentPageSize={input_outputs.length}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      onUpdatePage={onUpdatePage}
      error={error}
      omitPager={!hasNextPage && input_outputs.length <= pageSize}
      disablePadding
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    input_outputs: graphql`
      fragment TransactionInputOutputTable_input_outputs on TransactionInputOutput
        @relay(plural: true) {
        address_hash
        value
        asset {
          ...AssetNameLink_asset
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TransactionInputOutputTable): React.ComponentType<
  ExternalProps,
>);
