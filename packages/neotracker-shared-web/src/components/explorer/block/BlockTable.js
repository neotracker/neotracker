/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AddressLink } from '../address/lib';
import { BlockIndexLink, BlockTime, getBlockSize } from '../block/lib';
import { Table } from '../../common/table';

import { formatNumber } from '../../../utils';
import { fragmentContainer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type BlockTable_blocks } from './__generated__/BlockTable_blocks.graphql';

const styles = () => ({
  transactionsCol: {
    flex: '1 100 auto',
  },
  validatorCol: {
    flex: '1 100 auto',
  },
});

type ExternalProps = {|
  blocks: any,
  sizeVisibleAt?: string,
  validatorVisibleAt?: string,
  className?: string,
|};
type InternalProps = {|
  blocks: BlockTable_blocks,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockTable({
  blocks,
  sizeVisibleAt,
  validatorVisibleAt,
  className,
  classes,
}: Props): React.Element<*> {
  const heightValues = [];
  const timeValues = [];
  const transactionsValues = [];
  const validatorValues = [];
  const sizeValues = [];
  blocks.forEach(block => {
    heightValues.push(<BlockIndexLink blockIndex={block.index} />);
    timeValues.push(<BlockTime blockTime={block.time} />);
    transactionsValues.push(formatNumber(block.transaction_count));
    validatorValues.push(
      block.validator_address_id == null ? (
        'Genesis'
      ) : (
        <AddressLink addressHash={block.validator_address_id} />
      ),
    );
    sizeValues.push(getBlockSize(block.size));
  });
  const columns = [
    {
      name: 'Index',
      values: heightValues,
      minWidth: true,
    },
    {
      name: 'Time',
      values: timeValues,
      minWidth: true,
    },
    {
      name: 'Transactions',
      numeric: true,
      values: transactionsValues,
      className: classes.transactionsCol,
    },
    {
      name: 'Validator',
      values: validatorValues,
      visibleAt: validatorVisibleAt,
      className: classes.validatorCol,
    },
    {
      name: 'Size',
      values: sizeValues,
      visibleAt: sizeVisibleAt,
    },
  ];
  return <Table className={className} columns={columns} />;
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    blocks: graphql`
      fragment BlockTable_blocks on Block @relay(plural: true) {
        index
        time
        transaction_count
        validator_address_id
        size
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(BlockTable): React.ComponentType<ExternalProps>);
