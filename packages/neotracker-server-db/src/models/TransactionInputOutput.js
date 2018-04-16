/* @flow */
import { Model } from 'objection';

import {
  ADDRESS_VALIDATOR,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
  TYPE_INPUT,
  TYPE_DUPLICATE_CLAIM,
  SUBTYPE_NONE,
  SUBTYPE_ISSUE,
  SUBTYPE_ENROLLMENT,
  SUBTYPE_CLAIM,
  SUBTYPE_REWARD,
} from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

// Always starts as an output
// May be used as an input in contract (where it subtracts from the owner)
// or a claim (where it does not subtract from the owner)
export default class TransactionInputOutput extends BlockchainModel {
  static modelName = 'TransactionInputOutput';
  static exposeGraphQL: boolean = true;
  static indices = [
    {
      type: 'simple',
      columnNames: [
        'type',
        'output_transaction_index',
        'output_transaction_hash',
      ],
      name: 'tio_primary_key',
      unique: true,
    },
    {
      type: 'simple',
      columnNames: [
        'type',
        'output_transaction_index',
        'output_transaction_hash',
        'input_transaction_id',
      ],
      name: 'tio_type_output_index_hash_id',
    },
    {
      type: 'simple',
      columnNames: [
        'type',
        'output_transaction_index',
        'output_transaction_id',
      ],
      name: 'tio_type_output_index_id',
    },
    {
      type: 'simple',
      columnNames: [
        'type',
        'output_transaction_index',
        'output_transaction_hash',
        'input_transaction_hash',
      ],
      name: 'tio_type_output_index_output_hash_input_hash',
      unique: true,
    },
    {
      type: 'simple',
      columnNames: ['input_transaction_id', 'type'],
      name: 'tio_input_transaction_id_type',
    },
    {
      type: 'simple',
      columnNames: ['output_transaction_id', 'type'],
      name: 'tio_output_transaction_id_type',
    },
    {
      type: 'simple',
      columnNames: ['claim_transaction_id', 'type'],
      name: 'tio_claim_transaction_id_type',
    },
    {
      type: 'simple',
      columnNames: ['asset_id'],
      name: 'tio_asset_id_output_transaction',
    },
    {
      type: 'simple',
      columnNames: ['address_id', 'asset_hash'],
      name: 'tio_address_id_asset_hash_input_claim_transaction',
    },
    {
      type: 'simple',
      columnNames: ['address_id', 'asset_id', 'claim_transaction_id'],
      name: 'tio_address_id_asset_id_claim_transaction_id',
    },
  ];
  static bigIntID = true;

  static chainCustomAfter(schema: any): any {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION txio_update_tables() RETURNS trigger AS $txio_update_tables$
        BEGIN
          UPDATE asset
          SET issued=issued + NEW.value
          WHERE asset.id = NEW.asset_id;
          RETURN NULL;
        END;
      $txio_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      CREATE TRIGGER txio_update_tables AFTER INSERT
      ON transaction_input_output FOR EACH ROW
      WHEN (
        NEW.type = '${TYPE_INPUT}' AND
        NEW.input_transaction_hash IS NULL AND (
          NEW.subtype = '${SUBTYPE_ISSUE}' OR
          NEW.subtype = '${SUBTYPE_CLAIM}' OR
          NEW.subtype = '${SUBTYPE_REWARD}'
        )
      )
      EXECUTE PROCEDURE txio_update_tables()
    `);
  }

  static fieldSchema: FieldSchema = {
    type: {
      type: { type: 'string', enum: [TYPE_INPUT, TYPE_DUPLICATE_CLAIM] },
      required: true,
      exposeGraphQL: true,
    },
    subtype: {
      type: {
        type: 'string',
        enum: [
          SUBTYPE_NONE,
          SUBTYPE_ISSUE,
          SUBTYPE_ENROLLMENT,
          SUBTYPE_CLAIM,
          SUBTYPE_REWARD,
        ],
      },
      required: true,
      exposeGraphQL: true,
    },
    input_transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    input_transaction_id: {
      type: { type: 'foreignID', modelType: 'Transaction' },
    },
    claim_transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    claim_transaction_id: {
      type: { type: 'foreignID', modelType: 'Transaction' },
    },
    output_transaction_hash: {
      type: HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    output_transaction_id: {
      type: { type: 'foreignID', modelType: 'Transaction' },
      required: true,
    },
    output_transaction_index: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    output_block_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    asset_hash: {
      type: HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    asset_id: {
      type: { type: 'foreignID', modelType: 'Asset' },
      required: true,
    },
    value: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
    address_hash: {
      type: ADDRESS_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    address_id: {
      type: { type: 'foreignID', modelType: 'Address' },
      required: true,
    },
    claim_value: {
      type: { type: 'decimal' },
      exposeGraphQL: true,
    },
  };

  static edgeSchema: EdgeSchema = {
    input_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'transaction_input_output.input_transaction_id',
          to: 'transaction.id',
        },
        filter: queryBuilder =>
          queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },
      exposeGraphQL: true,
    },
    claim_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'transaction_input_output.claim_transaction_id',
          to: 'transaction.id',
        },
        filter: queryBuilder =>
          queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },
      exposeGraphQL: true,
    },
    duplicate_claim_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'transaction_input_output.claim_transaction_id',
          to: 'transaction.id',
        },
        filter: queryBuilder =>
          queryBuilder.where(
            'transaction_input_output.type',
            TYPE_DUPLICATE_CLAIM,
          ),
      },
      exposeGraphQL: true,
    },
    output_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'transaction_input_output.output_transaction_id',
          to: 'transaction.id',
        },
      },
      exposeGraphQL: true,
      required: true,
    },
    asset: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Asset').default;
        },
        join: {
          from: 'transaction_input_output.asset_id',
          to: 'asset.id',
        },
      },
      exposeGraphQL: true,
      required: true,
    },
    address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Address').default;
        },
        join: {
          from: 'transaction_input_output.address_id',
          to: 'address.id',
        },
      },
      exposeGraphQL: true,
      required: true,
    },
  };
}
