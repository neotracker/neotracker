/* @flow */
import {
  Base,
  BaseEdge,
  Action as ActionModel,
  Address as AddressModel,
  AddressToTransaction as AddressToTransactionModel,
  AddressToTransfer as AddressToTransferModel,
  Asset as AssetModel,
  AssetToTransaction as AssetToTransactionModel,
  Block as BlockModel,
  Coin as CoinModel,
  Contract as ContractModel,
  KnownContract as KnownContractModel,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
  Transfer as TransferModel,
  createIndices,
  createTable,
  dropIndices,
  refreshTriggers,
  modelSchemas,
} from 'neotracker-server-db';
import type { Monitor } from '@neo-one/monitor';

import { type Context } from '../types';

const runRaw = async (
  context: Context,
  monitor: Monitor,
  statement: string,
) => {
  await context.db
    .raw(statement)
    .queryContext(context.makeQueryContext(monitor));
};

const handleConvert = async (
  context: Context,
  monitor: Monitor,
  checkpoint: Set<string>,
  model: Class<Base>,
  isEdge: boolean,
  convert: () => Promise<void>,
): Promise<void> => {
  if (checkpoint.has(model.modelSchema.name)) {
    return;
  }

  if (!isEdge) {
    await dropIndices(context.db, monitor, model.modelSchema.tableName);
  }

  await convert();

  await createIndices(context.db, monitor, model.modelSchema);
  await refreshTriggers(context.db, monitor, model.modelSchema);

  checkpoint.add(model.modelSchema.name);
};

const handleConvertEdge = async (
  context: Context,
  monitor: Monitor,
  model: Class<BaseEdge<*, *>>,
  id1Type: string,
  id2Type: string,
  convert: () => Promise<void>,
) => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE ${model.tableName} RENAME TO ${model.tableName}_old;
  `,
  );
  await createTable(context.db, monitor, model.modelSchema, modelSchemas, true);

  await convert();

  await runRaw(
    context,
    monitor,
    `
    DROP TABLE ${model.tableName}_old;
  `,
  );
};

const convertAction = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE action
      ALTER COLUMN id TYPE varchar(255) USING block_index || '$' || transaction_index || '$' || index,
      ALTER COLUMN transaction_id TYPE varchar(64);
  `,
  );

  await runRaw(
    context,
    monitor,
    `
    UPDATE action SET transaction_id=a.hash
    FROM (
      SELECT
        a.hash,
        b.index AS block_index,
        a.index AS transaction_index
      FROM transaction a
      JOIN block b ON
        a.block_id = b.id
    ) a
    WHERE
      action.block_index = a.block_index AND
      action.transaction_index = a.transaction_index;
  `,
  );
};

const convertAddress = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE address
      ALTER COLUMN id TYPE varchar(34) USING hash,
      ALTER COLUMN transaction_id TYPE varchar(64) USING transaction_hash,
      ALTER COLUMN last_transaction_id TYPE varchar(64) USING last_transaction_hash,
      DROP COLUMN hash,
      DROP COLUMN transaction_hash,
      DROP COLUMN last_transaction_hash;
  `,
  );
};

const convertAsset = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE asset
      ALTER COLUMN id TYPE varchar(64) USING hash,
      ALTER COLUMN transaction_id TYPE varchar(64) USING transaction_hash,
      ALTER COLUMN admin_address_id TYPE varchar(34) USING admin_address_hash,
      DROP COLUMN hash,
      DROP COLUMN transaction_hash,
      DROP COLUMN admin_address_hash;
  `,
  );
};

const convertBlock = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE block
      ALTER COLUMN id TYPE varchar(64) USING hash,
      ALTER COLUMN validator_address_id TYPE varchar(34) USING validator_address_hash,
      ALTER COLUMN next_validator_address_id TYPE varchar(34) USING next_validator_address_hash,
      ALTER COLUMN previous_block_id TYPE varchar(64) USING previous_block_hash,
      ALTER COLUMN next_block_id TYPE varchar(64) USING next_block_hash,
      DROP COLUMN hash,
      DROP COLUMN validator_address_hash,
      DROP COLUMN next_validator_address_hash,
      DROP COLUMN previous_block_hash,
      DROP COLUMN next_block_hash;
  `,
  );
};

const convertCoin = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE coin
      ALTER COLUMN id TYPE varchar(255) USING address_hash || '$' || asset_hash,
      ALTER COLUMN address_id TYPE varchar(34) USING address_hash,
      ALTER COLUMN asset_id TYPE varchar(64) USING asset_hash,
      DROP COLUMN address_hash,
      DROP COLUMN asset_hash;
  `,
  );
};

const convertContract = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE contract
      ALTER COLUMN id TYPE varchar(40) USING hash,
      ALTER COLUMN transaction_id TYPE varchar(64) USING transaction_hash,
      DROP COLUMN hash,
      DROP COLUMN transaction_hash;
  `,
  );
};

const convertKnownContract = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE known_contract
      ALTER COLUMN id TYPE varchar(40) USING hash,
      DROP COLUMN hash;
  `,
  );
};

const convertTransaction = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    ALTER TABLE transaction
      ALTER COLUMN id TYPE varchar(64) USING hash,
      ALTER COLUMN block_id TYPE varchar(64) USING block_hash,
      DROP COLUMN hash,
      DROP COLUMN block_hash;
  `,
  );
};

const convertTransactionInputOutput = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    DROP TRIGGER txio_update_tables ON transaction_input_output;
    ALTER TABLE transaction_input_output
      ALTER COLUMN id TYPE varchar(255) USING output_transaction_hash || '$' || output_transaction_index || '$' || type,
      ALTER COLUMN address_id TYPE varchar(34) USING address_hash,
      ALTER COLUMN asset_id TYPE varchar(64) USING asset_hash,
      ALTER COLUMN input_transaction_id TYPE varchar(64) USING input_transaction_hash,
      ALTER COLUMN output_transaction_id TYPE varchar(64) USING output_transaction_hash,
      ALTER COLUMN claim_transaction_id TYPE varchar(64) USING claim_transaction_hash,
      DROP COLUMN address_hash,
      DROP COLUMN asset_hash,
      DROP COLUMN input_transaction_hash,
      DROP COLUMN output_transaction_hash,
      DROP COLUMN claim_transaction_hash;
  `,
  );
};

const convertTransfer = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await runRaw(
    context,
    monitor,
    `
    DROP TRIGGER transfer_update_tables ON transfer;
    ALTER TABLE transfer
      ALTER COLUMN id TYPE varchar(255) USING block_index || '$' || transaction_index || '$' || action_index,
      ALTER COLUMN transaction_id TYPE varchar(64) USING transaction_hash,
      ALTER COLUMN from_address_id TYPE varchar(34) USING from_address_hash,
      ALTER COLUMN to_address_id TYPE varchar(34) USING to_address_hash,
      ALTER COLUMN asset_id TYPE varchar(64) USING asset_hash,
      ALTER COLUMN contract_id TYPE varchar(40) USING '',
      DROP COLUMN transaction_hash,
      DROP COLUMN from_address_hash,
      DROP COLUMN to_address_hash,
      DROP COLUMN asset_hash,
      DROP COLUMN action_id;
  `,
  );

  await runRaw(
    context,
    monitor,
    `
    UPDATE transfer SET contract_id=a.script_hash
    FROM action a
    WHERE transfer.id = a.id
  `,
  );
};

const convertAddressToTransaction = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await handleConvertEdge(
    context,
    monitor,
    AddressToTransactionModel,
    'varchar(34)',
    'varchar(64)',
    async () => {
      await runRaw(
        context,
        monitor,
        `
        INSERT INTO address_to_transaction
        SELECT b.hash AS id1, c.hash AS id2
        FROM address_to_transaction_old AS a
        JOIN address b ON
          a.id1 = b.id
        JOIN transaction c ON
          a.id2 = c.id;
      `,
      );
    },
  );
};

const convertAddressToTransfer = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await handleConvertEdge(
    context,
    monitor,
    AddressToTransferModel,
    'varchar(34)',
    'varchar(255)',
    async () => {
      await runRaw(
        context,
        monitor,
        `
        INSERT INTO address_to_transfer
        SELECT
          b.hash AS id1,
          c.block_index || '$' || c.transaction_index || '$' || c.action_index AS id2
        FROM address_to_transfer_old AS a
        JOIN address b ON
          a.id1 = b.id
        JOIN transfer c ON
          a.id2 = c.id;
      `,
      );
    },
  );
};

const convertAssetToTransaction = async (
  context: Context,
  monitor: Monitor,
): Promise<void> => {
  await handleConvertEdge(
    context,
    monitor,
    AssetToTransactionModel,
    'varchar(64)',
    'varchar(64)',
    async () => {
      await runRaw(
        context,
        monitor,
        `
        INSERT INTO asset_to_transaction
        SELECT b.hash AS id1, c.hash AS id2
        FROM asset_to_transaction_old AS a
        JOIN asset b ON
          a.id1 = b.id
        JOIN transaction c ON
          a.id2 = c.id;
      `,
      );
    },
  );
};

const CONVERSIONS = [
  [
    AddressToTransactionModel,
    convertAddressToTransaction,
    'AddressToTransaction',
    true,
  ],
  [AddressToTransferModel, convertAddressToTransfer, 'AddressToTransfer', true],
  [
    AssetToTransactionModel,
    convertAssetToTransaction,
    'AssetToTransaction',
    true,
  ],
  [ActionModel, convertAction, 'Action', false],
  [AddressModel, convertAddress, 'Address', false],
  [AssetModel, convertAsset, 'Asset', false],
  [BlockModel, convertBlock, 'Block', false],
  [CoinModel, convertCoin, 'Coin', false],
  [ContractModel, convertContract, 'Contract', false],
  [KnownContractModel, convertKnownContract, 'KnownContract', false],
  [TransactionModel, convertTransaction, 'Transaction', false],
  [
    TransactionInputOutputModel,
    convertTransactionInputOutput,
    'TransactionInputOutput',
    false,
  ],
  [TransferModel, convertTransfer, 'Transfer', false],
];

export default async (
  context: Context,
  monitor: Monitor,
  checkpointName: string,
) => {
  const checkpointData = await context.migrationHandler.getCheckpoint(
    checkpointName,
    monitor,
  );
  let checkpoint;
  if (checkpointData == null) {
    checkpoint = new Set();
  } else {
    checkpoint = new Set(JSON.parse(checkpointData));
  }

  try {
    await monitor.at('migration_convert_ids').captureLog(
      async () => {
        for (const [model, convert, name, isEdge] of CONVERSIONS) {
          // eslint-disable-next-line
          await monitor
            .withData({ model: name })
            .captureLog(
              () =>
                handleConvert(context, monitor, checkpoint, model, isEdge, () =>
                  convert(context, monitor),
                ),
              { name: 'neotracker_scrape_convert_model', error: {} },
            );
        }
      },
      {
        name: 'neotracker_scrape_migration_convert_ids_main',
        error: {},
      },
    );
  } finally {
    await context.migrationHandler.checkpoint(
      checkpointName,
      JSON.stringify([...checkpoint]),
      monitor,
    );
  }
};
