import { ConfirmedInvocationTransaction, NetworkType } from '@neo-one/client-full';
import {
  Asset as AssetModel,
  Coin as CoinModel,
  ProcessedIndex as ProcessedIndexModel,
  Transfer as TransferModel,
} from '@neotracker/server-db';
import { Context } from '../types';

export type MigrationName = string;
export type MigrationFunc = (context: Context, name: string) => Promise<void>;
export type ShouldMigrateFunc = (context: Context) => Promise<boolean>;

const getAssetData = async ({
  context,
  assetHash,
  transactionHash,
  blockIndex,
}: {
  readonly context: Context;
  readonly assetHash: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
}) => {
  const [issuedAndAmount, addressCount, transferCount, lastProcessedIndex, block] = await Promise.all([
    CoinModel.query(context.db)
      .context(context.makeQueryContext())
      .sum('value')
      .where('asset_id', assetHash)
      .first(),
    CoinModel.query(context.db)
      .context(context.makeQueryContext())
      .count('address_id')
      .where('asset_id', assetHash)
      .first(),
    TransferModel.query(context.db)
      .context(context.makeQueryContext())
      .count('id')
      .where('asset_id', assetHash)
      .first(),
    ProcessedIndexModel.query(context.db)
      .context(context.makeQueryContext())
      .max('index')
      .first(),
    context.client.getBlock(blockIndex),
  ] as const);
  const transaction = block.transactions.filter((trans) => trans.hash === `0x${transactionHash}`)[0];
  const contract = (transaction as ConfirmedInvocationTransaction).invocationData.contracts[0];

  return {
    id: assetHash,
    transaction_id: transaction.receipt.globalIndex.toString(),
    transaction_hash: transactionHash,
    // tslint:disable-next-line: no-any
    amount: (issuedAndAmount as any).sum as string,
    block_time: block.time,
    // tslint:disable-next-line: no-any
    issued: (issuedAndAmount as any).sum as string,
    // tslint:disable-next-line: no-any
    address_count: (addressCount as any).count as string,
    // tslint:disable-next-line: no-any
    transfer_count: (transferCount as any).count as string,
    // tslint:disable-next-line: no-any
    aggregate_block_id: (lastProcessedIndex as any).max as number,
    owner: contract.author,
    admin_address_id: contract.address,
  };
};

const migrationBlockAboveCurrentBlock = async ({
  context,
  migrationBlock,
}: {
  readonly context: Context;
  readonly migrationBlock: number;
}) => {
  const lastBlock = await ProcessedIndexModel.query(context.db)
    .context(context.makeQueryContext())
    .max('index')
    .first();

  // tslint:disable-next-line: no-any
  return lastBlock === undefined ? false : ((lastBlock as any).max as number) >= migrationBlock;
};

const rpxMigrationBlock = 1444840;
const longMigrationBlock = 5752874;

// tslint:disable-next-line export-name
export const migrations: ReadonlyArray<readonly [string, MigrationFunc, ShouldMigrateFunc, NetworkType]> = [
  [
    'RPX',
    async (context, _) => {
      const assetHash = 'ecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9';
      const transactionHash = 'c8c9696476091fd63f4b0214715abe3eb10f4882a2959d4592c1f3cace800c24';
      const blockIndex = rpxMigrationBlock;
      const assetData = await getAssetData({ context, blockIndex, assetHash, transactionHash });

      await AssetModel.insertAll(context.db, context.makeQueryContext(), [
        {
          ...assetData,
          type: 'NEP5',
          name_raw: 'RPX Sale',
          symbol: 'RPX',
          precision: 8,
          transaction_count: '-1', // not possible to get w/o resync
        },
      ]);
    },
    async (context) => migrationBlockAboveCurrentBlock({ context, migrationBlock: rpxMigrationBlock }),
    'main',
  ],
  [
    'LONG',
    async (context, _) => {
      const assetHash = 'c3361fef35233f9db6354b259be9cde34ba667c5';
      const transactionHash = '3f2688208983c72d530233df6a171583457805825023d9d19279d7114fea5f48';
      const blockIndex = longMigrationBlock;
      const assetData = await getAssetData({ context, blockIndex, transactionHash, assetHash });

      await AssetModel.insertAll(context.db, context.makeQueryContext(), [
        {
          ...assetData,
          type: 'NEP5',
          name_raw: 'LONG',
          symbol: 'LONG',
          precision: 8,
          transaction_count: '632681', // per NEOSCAN on 08/03/20 15:19PDT
        },
      ]);
    },
    async (context) => migrationBlockAboveCurrentBlock({ context, migrationBlock: longMigrationBlock }),
    'main',
  ],
];
