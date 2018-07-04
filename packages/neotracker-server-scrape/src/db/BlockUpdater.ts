import { Block } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { Block as BlockModel } from 'neotracker-server-db';
import { Context } from '../types';
import { AddressesUpdater } from './AddressesUpdater';
import { DBUpdater } from './DBUpdater';
import { PrevBlockUpdater } from './PrevBlockUpdater';
import { ProcessedIndexUpdater } from './ProcessedIndexUpdater';
import { TransactionsUpdater } from './TransactionsUpdater';
import { getCurrentHeight, getPreviousBlockModel } from './utils';

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

export class BlockUpdater extends DBUpdater<Block, BlockModel> {
  private readonly updaters: BlockUpdaters;

  public constructor(
    context: Context,
    updaters: BlockUpdaters = {
      address: new AddressesUpdater(context),
      processedIndex: new ProcessedIndexUpdater(context),
      prevBlock: new PrevBlockUpdater(context),
      transactions: new TransactionsUpdater(context),
    },
  ) {
    super(context);
    this.updaters = updaters;
  }

  public async save(monitor: Monitor, block: Block): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const [height, prevBlockModel] = await Promise.all([
          getCurrentHeight(this.context, span),
          getPreviousBlockModel(this.context, span, block.index),
        ]);
        if (block.index === height + 1) {
          if (prevBlockModel === undefined || block.previousBlockHash === prevBlockModel.hash) {
            const systemFee = block.transactions.reduce(
              (sysFee, transaction) => sysFee.plus(new BigNumber(transaction.systemFee)),
              ZERO,
            );
            const aggregatedSystemFee =
              prevBlockModel === undefined
                ? systemFee
                : new BigNumber(prevBlockModel.aggregated_system_fee).plus(systemFee);
            let prevBlockData = {};
            if (prevBlockModel !== undefined) {
              prevBlockData = {
                previous_block_id: prevBlockModel.id,
                previous_block_hash: prevBlockModel.hash,
                validator_address_id: prevBlockModel.next_validator_address_id,
              };
            }

            const [blockModel] = await Promise.all([
              BlockModel.insertAndReturn(this.context.db, this.context.makeQueryContext(span), {
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
                if (this.isUniqueError(error)) {
                  return BlockModel.query(this.context.db)
                    .context(this.context.makeQueryContext(span))
                    .where('id', block.index)
                    .first()
                    .throwIfNotFound();
                }
                throw error;
              }),
              this.updaters.address.save(span, {
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
              this.context.systemFee.save(
                {
                  index: block.index,
                  value: aggregatedSystemFee.toFixed(8),
                },
                span,
              ),
              this.updaters.prevBlock.save(span, { block, prevBlockModel }),
              this.updaters.transactions.save(span, { block }),
            ]);

            await this.updaters.processedIndex.save(span, block.index);

            // tslint:disable no-object-mutation
            this.context.prevBlock = blockModel;
            this.context.currentHeight = blockModel.id;
            // tslint:enable no-object-mutation
          } else {
            const [prevBlock] = await Promise.all([
              this.context.client.getBlock(height),
              this.revert(span, prevBlockModel),
            ]);
            await this.save(span, prevBlock);
          }
        } else if (block.index === height) {
          const blockModel = await BlockModel.query(this.context.db)
            .context(this.context.makeQueryContext(span))
            .findById(block.index)
            .throwIfNotFound();
          if (block.hash !== blockModel.hash) {
            await this.revert(span, blockModel);
            await this.save(span, block);
          }
        }
      },
      { name: 'neotracker_scrape_save_block' },
    );
  }

  public async revert(monitor: Monitor, blockModel: BlockModel): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const prevBlockModel = await getPreviousBlockModel(this.context, span, blockModel.id);
        await Promise.all([
          this.updaters.address.revert(span, {
            addresses: [
              {
                id: blockModel.next_validator_address_id,
              },
            ],
            blockIndex: blockModel.id,
          }),
          this.updaters.transactions.revert(span, { blockModel }),
          this.context.systemFee.revert(blockModel.id, span),
          this.updaters.prevBlock.revert(span, prevBlockModel),
        ]);

        await blockModel
          .$query(this.context.db)
          .context(this.context.makeQueryContext(span))
          .delete();
        await this.updaters.processedIndex.revert(span, blockModel.id);

        const prevPrevBlockModel = await getPreviousBlockModel(this.context, monitor, blockModel.id - 1);
        // tslint:disable no-object-mutation
        this.context.prevBlock = prevPrevBlockModel;
        this.context.currentHeight = prevPrevBlockModel === undefined ? -1 : prevPrevBlockModel.id;
        // tslint:enable no-object-mutation
      },
      { name: 'neotracker_scrape_revert_block' },
    );
  }
}
