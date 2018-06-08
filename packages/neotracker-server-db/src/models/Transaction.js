/* @flow */
import { GAS_ASSET_HASH } from 'neotracker-shared-utils';
import { Model } from 'objection';

import { type EdgeSchema, type FieldSchema } from '../lib';

import {
  BIG_INT_ID,
  BLOCK_TIME_COLUMN,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
  SUBTYPE_ENROLLMENT,
  TYPE_INPUT,
  TYPE_DUPLICATE_CLAIM,
} from './common';
import BlockchainModel from './BlockchainModel';

export const TRANSACTION_TYPES = [
  'MinerTransaction',
  'IssueTransaction',
  'ClaimTransaction',
  'EnrollmentTransaction',
  'RegisterTransaction',
  'ContractTransaction',
  'PublishTransaction',
  'InvocationTransaction',
  'StateTransaction',
];

export default class Transaction extends BlockchainModel<string> {
  id: string;
  hash: string;
  type: string;
  size: number;
  version: number;
  attributes_raw: string;
  system_fee: string;
  network_fee: string;
  nonce: string;
  pubkey: string;
  block_id: number;
  block_time: number;
  index: number;
  scripts_raw: string;
  script: string;
  gas: string;
  results_raw: string;

  static modelName = 'Transaction';
  static exposeGraphQL: boolean = true;
  static idDesc: boolean = true;
  static indices = [
    // BlockTransactionPagingView
    {
      type: 'order',
      columns: [
        {
          name: 'block_id',
          order: 'desc',
        },
        {
          name: 'index',
          order: 'asc',
        },
      ],
      name: 'transaction_block_id_index',
    },
    // Home, TransactionSearch
    {
      type: 'order',
      columns: [
        {
          name: 'id',
          order: 'desc',
        },
        {
          name: 'type',
          order: 'asc',
        },
      ],
      name: 'transaction_id_type',
    },
    // run$
    {
      type: 'order',
      columns: [
        {
          name: 'hash',
          order: 'asc',
        },
      ],
      name: 'transaction_hash',
    },
  ];

  static chainCustomAfter(schema: any): any {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION tx_update_tables() RETURNS trigger AS $tx_update_tables$
        BEGIN
          UPDATE asset
          SET issued=issued - (NEW.system_fee + NEW.network_fee)
          WHERE asset.id = '${GAS_ASSET_HASH}';
          RETURN NULL;
        END;
      $tx_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS tx_update_tables
      ON transaction;

      CREATE TRIGGER tx_update_tables AFTER INSERT
      ON transaction FOR EACH ROW
      WHEN (NEW.system_fee > 0 OR NEW.network_fee > 0)
      EXECUTE PROCEDURE tx_update_tables()
    `);
  }

  static fieldSchema: FieldSchema = {
    id: {
      type: BIG_INT_ID,
      required: true,
      exposeGraphQL: true,
    },
    hash: {
      type: HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    type: {
      type: {
        type: 'string',
        enum: TRANSACTION_TYPES,
      },
      required: true,
      exposeGraphQL: true,
    },
    size: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    version: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    attributes_raw: {
      type: { type: 'string' },
      required: true,
    },
    system_fee: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
    network_fee: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
    nonce: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
    pubkey: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
    block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    block_time: BLOCK_TIME_COLUMN,
    index: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    scripts_raw: {
      type: { type: 'string' },
      required: true,
    },
    scripts: {
      type: {
        type: 'custom',
        graphqlType: '[Script!]!',
      },
      graphqlResolver: async (obj: Object) => {
        if (obj.scripts != null) {
          return obj.scripts;
        }

        return typeof obj.scripts_raw === 'string'
          ? JSON.parse(obj.scripts_raw)
          : obj.scripts_raw;
      },
      required: true,
      exposeGraphQL: true,
      computed: true,
    },
    script: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
    gas: {
      type: { type: 'decimal' },
      exposeGraphQL: true,
    },
    result_raw: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
  };

  static edgeSchema: EdgeSchema = {
    inputs: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./TransactionInputOutput').default;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.input_transaction_id',
        },
        filter: queryBuilder =>
          queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },
      exposeGraphQL: true,
    },
    outputs: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./TransactionInputOutput').default;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.output_transaction_id',
        },
        filter: queryBuilder =>
          queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },
      exposeGraphQL: true,
    },
    enrollment: {
      relation: {
        relation: Model.HasOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./TransactionInputOutput').default;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.output_transaction_id',
        },
        filter: queryBuilder =>
          queryBuilder.where(
            'transaction_input_output.subtype',
            SUBTYPE_ENROLLMENT,
          ),
      },
      exposeGraphQL: true,
    },
    claims: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./TransactionInputOutput').default;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.claim_transaction_id',
        },
        filter: queryBuilder =>
          queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },
      exposeGraphQL: true,
    },
    duplicate_claims: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./TransactionInputOutput').default;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.claim_transaction_id',
        },
        filter: queryBuilder =>
          queryBuilder.where(
            'transaction_input_output.type',
            TYPE_DUPLICATE_CLAIM,
          ),
      },
      exposeGraphQL: true,
    },
    asset: {
      relation: {
        relation: Model.HasOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Asset').default;
        },
        join: {
          from: 'transaction.id',
          to: 'asset.transaction_id',
        },
      },
      exposeGraphQL: true,
    },
    block: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Block').default;
        },
        join: {
          from: 'transaction.block_id',
          to: 'block.id',
        },
      },
      required: true,
      exposeGraphQL: true,
    },
    contracts: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Contract').default;
        },
        join: {
          from: 'transaction.id',
          to: 'contract.transaction_id',
        },
      },
      exposeGraphQL: true,
    },
    actions: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Action').default;
        },
        join: {
          from: 'transaction.id',
          to: 'action.transaction_id',
        },
      },
      exposeGraphQL: true,
    },
    transfers: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transfer').default;
        },
        join: {
          from: 'transaction.id',
          to: 'transfer.transaction_id',
        },
      },
      exposeGraphQL: true,
    },
  };
}
