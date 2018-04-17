/* @flow */
import { Model } from 'objection';

import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
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
export default class TransactionInputOutput extends BlockchainModel<string> {
  id: string;
  type: string;
  subtype: string;
  input_transaction_id: string;
  claim_transaction_id: string;
  output_transaction_id: string;
  output_block_index: number;
  asset_id: string;
  value: string;
  address_id: string;
  claim_value: string;

  static modelName = 'TransactionInputOutput';
  static exposeGraphQL: boolean = true;
  static indices = [
    // TransactionInputPagingTable
    {
      type: 'order',
      columns: [
        {
          name: 'input_transaction_id',
          order: 'asc nulls last',
        },
        {
          name: 'type',
          order: 'asc nulls last',
        },
        {
          name: 'output_transaction_index',
          order: 'asc nulls last',
        },
      ],
      name: 'tio_input_transaction_id_type_output_transaction_index',
    },
    // TransactionOutputPagingTable, run$
    {
      type: 'order',
      columns: [
        {
          name: 'output_transaction_id',
          order: 'asc nulls last',
        },
        {
          name: 'type',
          order: 'asc nulls last',
        },
        {
          name: 'output_transaction_index',
          order: 'asc nulls last',
        },
      ],
      name: 'tio_output_transaction_id_type_output_transaction_index',
    },
    // TransactionClaimPagingTable
    {
      type: 'order',
      columns: [
        {
          name: 'claim_transaction_id',
          order: 'asc nulls last',
        },
        {
          name: 'type',
          order: 'asc nulls last',
        },
        {
          name: 'output_transaction_index',
          order: 'asc nulls last',
        },
      ],
      name: 'tio_claim_transaction_id_type_output_transaction_index',
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
      DROP TRIGGER IF EXISTS txio_update_tables
      ON transaction_input_output;

      CREATE TRIGGER txio_update_tables AFTER INSERT
      ON transaction_input_output FOR EACH ROW
      WHEN (
        NEW.type = '${TYPE_INPUT}' AND
        NEW.input_transaction_id IS NULL AND (
          NEW.subtype = '${SUBTYPE_ISSUE}' OR
          NEW.subtype = '${SUBTYPE_CLAIM}' OR
          NEW.subtype = '${SUBTYPE_REWARD}'
        )
      )
      EXECUTE PROCEDURE txio_update_tables()
    `);
  }

  static makeID({
    outputTransactionHash,
    outputTransactionIndex,
    type,
  }: {|
    outputTransactionHash: string,
    outputTransactionIndex: number,
    type: string,
  |}): string {
    return [outputTransactionHash, outputTransactionIndex, type].join('$');
  }

  static fieldSchema: FieldSchema = {
    id: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },
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
    input_transaction_id: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    claim_transaction_id: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    output_transaction_id: {
      type: HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
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
    asset_id: {
      type: ASSET_HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    value: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
    address_id: {
      type: ADDRESS_VALIDATOR,
      required: true,
      exposeGraphQL: true,
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
