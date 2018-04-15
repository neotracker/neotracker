/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AddressLink } from '../address/lib';
import { BlockHashLink, BlockTime, getBlockSize } from '../block/lib';
import { PageView } from '../../common/view';

import { formatNumber } from '../../../utils';
import { fragmentContainer } from '../../../graphql/relay';
import * as routes from '../../../routes';

import { type BlockView_block } from './__generated__/BlockView_block.graphql';
import BlockViewExtra from './BlockViewExtra';

type ExternalProps = {|
  block: any,
  className?: string,
|};
type InternalProps = {|
  block: BlockView_block,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockView({ block, className }: Props): React.Element<*> {
  const columns = [
    ['Hash', block.hash],
    ['Index', formatNumber(block.index)],
    ['Time', <BlockTime blockTime={block.time} />],
  ];
  if (block.validator_address_hash != null) {
    columns.push(
      ...[
        [
          'Validator',
          <AddressLink addressHash={block.validator_address_hash} />,
        ],
      ],
    );
  }
  columns.push(
    ...[
      ['Confirmations', formatNumber(block.confirmations)],
      ['Size', getBlockSize(block.size)],
      ['Version', formatNumber(block.version)],
      ['Merkle Root', block.merkle_root],
      ['Transactions', formatNumber(block.transaction_count)],
    ],
  );

  if (block.previous_block_hash != null) {
    columns.push([
      'Previous Block',
      <BlockHashLink blockHash={block.previous_block_hash} />,
    ]);
  }

  if (block.next_block_hash != null) {
    columns.push([
      'Next Block',
      <BlockHashLink blockHash={block.next_block_hash} />,
    ]);
  }

  return (
    <PageView
      className={className}
      id={block.hash}
      title="Block"
      name="Block"
      pluralName="Blocks"
      searchRoute={routes.makeBlockSearch(1)}
      bodyColumns={columns}
      extra={<BlockViewExtra block={block} />}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    block: graphql`
      fragment BlockView_block on Block {
        hash
        index
        confirmations
        size
        version
        time
        previous_block_hash
        next_block_hash
        merkle_root
        transaction_count
        validator_address_hash
        ...BlockViewExtra_block
      }
    `,
  }),
  pure,
);

export default (enhance(BlockView): React.ComponentType<ExternalProps>);
