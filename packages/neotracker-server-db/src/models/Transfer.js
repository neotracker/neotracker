/* @flow */
import { Model } from 'objection';

import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
  BLOCK_TIME_COLUMN,
  CONTRACT_VALIDATOR,
  HASH_VALIDATOR,
  BIG_INT_ID,
  INTEGER_INDEX_VALIDATOR,
} from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

export default class Transfer extends BlockchainModel<string> {
  id: string;
  transaction_id: string;
  transaction_hash: string;
  asset_id: string;
  contract_id: string;
  value: string;
  from_address_id: string;
  to_address_id: string;
  block_id: number;
  transaction_index: number;
  action_index: number;
  block_time: number;

  static modelName = 'Transfer';
  static exposeGraphQL: boolean = true;
  static idDesc: boolean = true;
  static indices = [
    // AssetTransferPagingView
    {
      type: 'order',
      columns: [
        {
          name: 'asset_id',
          order: 'asc',
        },
        {
          name: 'id',
          order: 'desc',
        },
      ],
      name: 'transfer_asset_id_id',
    },
    // TransactionView
    {
      type: 'order',
      columns: [
        {
          name: 'transaction_id',
          order: 'desc',
        },
      ],
      name: 'transfer_transaction_id',
    },
  ];

  static chainCustomAfter(schema: any): any {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION transfer_update_tables() RETURNS trigger AS $transfer_update_tables$
        BEGIN
          IF (TG_OP = 'INSERT' AND NEW.from_address_id IS NULL) THEN
            UPDATE asset
            SET issued=issued + NEW.value, transfer_count=transfer_count + 1
            WHERE asset.id = NEW.asset_id;
          ELSIF (TG_OP = 'INSERT' AND NEW.to_address_id IS NULL) THEN
            UPDATE asset
            SET issued=issued - NEW.value, transfer_count=transfer_count + 1
            WHERE asset.id = NEW.asset_id;
          ELSIF (TG_OP = 'INSERT') THEN
            UPDATE asset
            SET transfer_count=transfer_count + 1
            WHERE asset.id = NEW.asset_id;
          END IF;
          RETURN NULL;
        END;
      $transfer_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS transfer_update_tables
      ON transfer;

      CREATE TRIGGER transfer_update_tables AFTER INSERT OR UPDATE OR DELETE
      ON transfer FOR EACH ROW EXECUTE PROCEDURE
      transfer_update_tables()
    `);
  }

  static fieldSchema: FieldSchema = {
    // Action id
    id: {
      type: BIG_INT_ID,
      required: true,
      exposeGraphQL: true,
    },
    transaction_id: {
      type: BIG_INT_ID,
      exposeGraphQL: true,
      required: true,
    },
    transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    asset_id: {
      type: ASSET_HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    contract_id: {
      type: CONTRACT_VALIDATOR,
      required: true,
    },
    value: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
    from_address_id: {
      type: ADDRESS_VALIDATOR,
      exposeGraphQL: true,
    },
    to_address_id: {
      type: ADDRESS_VALIDATOR,
      exposeGraphQL: true,
    },
    block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    transaction_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    action_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    block_time: BLOCK_TIME_COLUMN,
  };

  static edgeSchema: EdgeSchema = {
    transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'transfer.transaction_id',
          to: 'transaction.id',
        },
      },
      exposeGraphQL: true,
    },
    asset: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Asset').default;
        },
        join: {
          from: 'transfer.asset_id',
          to: 'asset.id',
        },
      },
      exposeGraphQL: true,
      required: true,
    },
    action: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Action').default;
        },
        join: {
          from: 'transfer.id',
          to: 'action.id',
        },
      },
      exposeGraphQL: true,
      required: true,
    },
    contract: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Contract').default;
        },
        join: {
          from: 'transfer.contract_id',
          to: 'contract.id',
        },
      },
      exposeGraphQL: true,
      required: true,
    },
    from_address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Address').default;
        },
        join: {
          from: 'transfer.from_address_id',
          to: 'address.id',
        },
      },
      exposeGraphQL: true,
    },
    to_address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Address').default;
        },
        join: {
          from: 'transfer.to_address_id',
          to: 'address.id',
        },
      },
      exposeGraphQL: true,
    },
  };
}
