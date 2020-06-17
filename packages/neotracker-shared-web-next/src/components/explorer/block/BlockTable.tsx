// tslint:disable: no-array-mutation
import * as React from 'react';
import { formatNumber, getNumericID } from '../../../utils';
import { Table } from '../../common/table';
import { AddressLink } from '../address/lib';
import { BlockIndexLink, BlockTime, getBlockSize } from './lib';
// import { fragmentContainer, getNumericID } from '../../../graphql/relay';
// import { BlockTable_blocks } from './__generated__/BlockTable_blocks.graphql';

// const styles = () => ({
//   transactionsCol: {
//     flex: '1 100 auto',
//   },
//   validatorCol: {
//     flex: '1 100 auto',
//   },
// });

interface Block {
  readonly id: string;
  readonly time: number;
  readonly transaction_count: number;
  readonly validator_address_id: string | undefined;
  readonly size: number;
}

interface Props {
  // readonly blocks: BlockTable_blocks;
  readonly blocks: readonly Block[];
  readonly sizeVisibleAt?: string;
  readonly validatorVisibleAt?: string;
}

export function BlockTable({ blocks, sizeVisibleAt, validatorVisibleAt }: Props) {
  const heightValues: React.ReactElement[] = [];
  const timeValues: React.ReactElement[] = [];
  const transactionsValues: string[] = [];
  const validatorValues: Array<string | React.ReactElement> = [];
  const sizeValues: string[] = [];
  blocks.forEach((block) => {
    heightValues.push(<BlockIndexLink blockIndex={getNumericID(block.id)} />);
    timeValues.push(<BlockTime blockTime={block.time} />);
    transactionsValues.push(formatNumber(block.transaction_count));
    validatorValues.push(
      block.validator_address_id === undefined ? 'Genesis' : <AddressLink addressHash={block.validator_address_id} />,
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
      // className: classes.transactionsCol,
    },
    {
      name: 'Validator',
      values: validatorValues,
      visibleAt: validatorVisibleAt,
      // className: classes.validatorCol,
    },
    {
      name: 'Size',
      values: sizeValues,
      visibleAt: sizeVisibleAt,
    },
  ];

  return <Table columns={columns} />;
}

// fragmentContainer({
//   blocks: graphql`
//     fragment BlockTable_blocks on Block @relay(plural: true) {
//       id
//       time
//       transaction_count
//       validator_address_id
//       size
//     }
//   `,
// }),
