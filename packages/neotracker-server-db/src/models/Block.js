/* @flow */
import { Model } from 'objection';

import {
  ADDRESS_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
  BLOCK_TIME_VALIDATOR,
  HASH_VALIDATOR,
  NONCE_VALIDATOR,
} from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

export default class Block extends BlockchainModel {
  static modelName = 'Block';
  static exposeGraphQL: boolean = true;
  static indices = [
    {
      type: 'simple',
      columnNames: ['hash'],
      name: 'block_hash',
      unique: true,
    },
    {
      type: 'order',
      columns: [
        {
          name: 'index',
          order: 'DESC NULLS LAST',
        },
      ],
      name: 'block_index',
      unique: true,
    },
  ];
  static bigIntID = true;

  static fieldSchema: FieldSchema = {
    hash: {
      type: HASH_VALIDATOR,
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
    merkle_root: {
      type: HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    time: {
      type: BLOCK_TIME_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    nonce: {
      type: NONCE_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    validator_address_hash: {
      type: ADDRESS_VALIDATOR,
      exposeGraphQL: true,
    },
    validator_address_id: {
      type: { type: 'foreignID', modelType: 'Address' },
    },
    next_validator_address_hash: {
      type: ADDRESS_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    next_validator_address_id: {
      type: { type: 'foreignID', modelType: 'Address' },
      required: true,
    },
    invocation_script: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },
    verification_script: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },
    confirmations: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
      computed: true,
      graphqlResolver: async (obj, args, context) => {
        const maxIndex = await context.rootLoader.maxIndexFetcher.get();
        return maxIndex - obj.index + 1;
      },
    },
    transaction_count: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    previous_block_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    previous_block_id: {
      type: { type: 'foreignID', modelType: 'Block' },
      exposeGraphQL: true,
    },
    next_block_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    next_block_id: {
      type: { type: 'foreignID', modelType: 'Block' },
      exposeGraphQL: true,
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
    aggregated_system_fee: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
    script: {
      type: {
        type: 'custom',
        graphqlType: 'Script!',
      },
      graphqlResolver: async (obj: Object) => {
        if (obj.script != null) {
          return obj.script;
        }

        return {
          invocation_script: obj.invocation_script,
          verification_script: obj.verification_script,
        };
      },
      required: true,
      exposeGraphQL: true,
      computed: true,
    },
  };

  static edgeSchema: EdgeSchema = {
    transactions: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'block.id',
          to: 'transaction.block_id',
        },
      },
      exposeGraphQL: true,
    },
    validator_address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Address').default;
        },
        join: {
          from: 'block.validator_address_id',
          to: 'address.id',
        },
      },
    },
    next_validator_address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Address').default;
        },
        join: {
          from: 'block.next_validator_address_id',
          to: 'address.id',
        },
      },
      required: true,
    },
    previous_block: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Block').default;
        },
        join: {
          from: 'block.previous_block_id',
          to: 'block.id',
        },
      },
    },
    next_block: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Block').default;
        },
        join: {
          from: 'block.next_block_id',
          to: 'block.id',
        },
      },
    },
  };
}
