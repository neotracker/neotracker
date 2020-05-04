import { Block } from '@neo-one/client-full';
import { createChild, serverLogger } from '@neotracker/logger';
import { Block as BlockModel, isUniqueError } from '@neotracker/server-db';
import BigNumber from 'bignumber.js';
import { Context } from '../types';
import { AddressesUpdater } from './AddressesUpdater';
import { DBUpdater } from './DBUpdater';
import { PrevBlockUpdater } from './PrevBlockUpdater';
import { ProcessedIndexUpdater } from './ProcessedIndexUpdater';
import { TransactionsUpdater } from './TransactionsUpdater';
import { getCurrentHeight, getPreviousBlockData } from './utils';

const ZERO = new BigNumber(0);

export interface BlockUpdate {
  readonly id: string;
  readonly blockIndex: number;
  readonly actionGlobalIndex: BigNumber;
}

export interface BlockUpdaters {
  readonly address: AddressesUpdater;
  readonly processedIndex: ProcessedIndexUpdater;
  readonly prevBlock: PrevBlockUpdater;
  readonly transactions: TransactionsUpdater;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class BlockUpdater extends DBUpdater<Block, BlockModel> {
  private readonly updaters: BlockUpdaters;

  public constructor(
    updaters: BlockUpdaters = {
      address: new AddressesUpdater(),
      processedIndex: new ProcessedIndexUpdater(),
      prevBlock: new PrevBlockUpdater(),
      transactions: new TransactionsUpdater(),
    },
  ) {
    super();
    this.updaters = updaters;
  }

  public async save(context: Context, block: Block): Promise<Context> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_block' });
    const [height, prevBlockData] = await Promise.all([
      getCurrentHeight(context),
      getPreviousBlockData(context, block.index),
    ] as const);
    if (block.index === height + 1) {
      if (prevBlockData === undefined || block.previousBlockHash === prevBlockData.previous_block_hash) {
        const systemFee = block.transactions.reduce(
          (sysFee, transaction) => sysFee.plus(new BigNumber(transaction.systemFee)),
          ZERO,
        );
        const aggregatedSystemFee =
          prevBlockData === undefined ? systemFee : new BigNumber(prevBlockData.aggregated_system_fee).plus(systemFee);

        const [innerNextContext] = await Promise.all([
          this.updaters.transactions.save(context, { block }),
          BlockModel.insertAndReturn(context.db, context.makeQueryContext(), {
            ...prevBlockData,
            id: block.index,
            hash: block.hash,
            size: block.size,
            version: block.version,
            merkle_root: block.merkleRoot,
            time: block.time,
            nonce: block.nonce,
            next_validator_address_id: block.nextConsensus,
            invocation_script: block.script.invocation,
            verification_script: block.script.verification,
            transaction_count: block.transactions.length,
            system_fee: systemFee.toFixed(8),
            network_fee: block.transactions
              .reduce(
                (networkFee, transaction) => networkFee.plus(new BigNumber(transaction.networkFee)),
                new BigNumber('0'),
              )
              .toFixed(8),
            aggregated_system_fee: aggregatedSystemFee.toFixed(8),
          }).catch((error) => {
            if (isUniqueError(context.db, error)) {
              return BlockModel.query(context.db)
                .context(context.makeQueryContext())
                .where('id', block.index)
                .first()
                .throwIfNotFound();
            }
            throw error;
          }),
          this.updaters.address.save(context, {
            addresses: [
              {
                id: block.nextConsensus,
                // tslint:disable no-null-keyword
                transaction_id: null,
                transaction_hash: null,
                // tslint:enable no-null-keyword
                block_id: block.index,
                block_time: block.time,
                transaction_count: '0',
                transfer_count: '0',
                aggregate_block_id: -1,
              },
            ],
          }),
          context.systemFee.save({
            index: block.index,
            value: aggregatedSystemFee.toFixed(8),
          }),
          this.updaters.prevBlock.save(context, { block }),
        ]);

        await this.updaters.processedIndex.save(innerNextContext, block.index);

        return {
          ...innerNextContext,
          prevBlockData: {
            previous_block_id: block.index,
            previous_block_hash: block.hash,
            validator_address_id: block.nextConsensus,
            aggregated_system_fee: aggregatedSystemFee.toFixed(8),
          },
          currentHeight: block.index,
        };
      }

      const prevBlockModel = await BlockModel.query(context.db)
        .context(context.makeQueryContext())
        .where('id', block.index - 1)
        .first()
        .throwIfNotFound();

      const [prevBlock, nextContext] = await Promise.all([
        context.client.getBlock(height),
        this.revert(context, prevBlockModel),
      ]);

      return this.save(nextContext, prevBlock);
    }

    if (block.index === height) {
      const blockModel = await BlockModel.query(context.db)
        .context(context.makeQueryContext())
        .findById(block.index)
        .throwIfNotFound();
      if (block.hash !== blockModel.hash) {
        const nextContext = await this.revert(context, blockModel);

        return this.save(nextContext, block);
      }
    }

    return context;
  }

  public async revert(context: Context, blockModel: BlockModel): Promise<Context> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_block' });
    await Promise.all([
      this.updaters.address.revert(context, {
        addresses: [
          {
            id: blockModel.next_validator_address_id,
          },
        ],
        blockIndex: blockModel.id,
      }),
      this.updaters.transactions.revert(context, { blockModel }),
      context.systemFee.revert(blockModel.id),
      this.updaters.prevBlock.revert(context, { blockIndex: blockModel.id }),
    ]);

    await blockModel
      .$query(context.db)
      .context(context.makeQueryContext())
      .delete();
    await this.updaters.processedIndex.revert(context, blockModel.id);

    const prevBlockData = await getPreviousBlockData(context, blockModel.id - 1);

    return {
      ...context,
      prevBlockData,
      currentHeight: prevBlockData === undefined ? -1 : prevBlockData.previous_block_id,
    };
  }
}
