/* @flow */
import { GAS_ASSET_HASH } from 'neotracker-shared-utils';
import { Model } from 'objection';

import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
  BLOCK_TIME_COLUMN,
  BIG_INT_ID,
  HASH_VALIDATOR,
  NEP5_CONTRACT_TYPE,
} from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

import { calculateAvailableGAS } from '../utils';

export const ASSET_TYPES = [
  'CreditFlag',
  'DutyFlag',
  'GoverningToken',
  'UtilityToken',
  'Currency',
  'Share',
  'Invoice',
  'Token',
  NEP5_CONTRACT_TYPE,
];

export default class Asset extends BlockchainModel<string> {
  id: string;
  transaction_id: string;
  transaction_hash: string;
  type: string;
  name_raw: string;
  name: string;
  symbol: string;
  amount: string;
  precision: number;
  owner: string;
  admin_address_id: string;
  block_time: number;
  issued: string;
  available: string;
  address_count: string;
  transaction_count: string;
  transfer_count: string;

  static modelName = 'Asset';
  static exposeGraphQL: boolean = true;
  static indices = [
    // AssetSearch
    {
      type: 'order',
      columns: [
        {
          name: 'transaction_count',
          order: 'desc',
        },
        {
          name: 'id',
          order: 'asc',
        },
      ],
      name: 'asset_transaction_count_id',
    },
  ];

  static fieldSchema: FieldSchema = {
    id: {
      type: ASSET_HASH_VALIDATOR,
      exposeGraphQL: true,
      required: true,
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
    type: {
      type: { type: 'string', enum: ASSET_TYPES },
      required: true,
      exposeGraphQL: true,
    },
    name_raw: {
      type: { type: 'string' },
      required: true,
    },
    name: {
      type: {
        type: 'custom',
        graphqlType: '[AssetName!]!',
        typeDefs: {
          AssetName: `
            type AssetName {
              lang: String!
              name: String!
            }
          `,
        },
      },
      graphqlResolver: async (obj: Object) => {
        if (obj.name != null) {
          return obj.name;
        }

        try {
          const result =
            typeof obj.name_raw === 'string'
              ? JSON.parse(obj.name_raw)
              : obj.name_raw;

          if (typeof result === 'string') {
            return [
              {
                lang: 'en',
                name: result,
              },
            ];
          }

          return result;
        } catch (error) {
          return [
            {
              lang: 'en',
              name: obj.name_raw,
            },
          ];
        }
      },
      required: true,
      exposeGraphQL: true,
      computed: true,
    },
    symbol: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },
    amount: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
    precision: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    // Does not necessarily exist for NEP-5 tokens
    owner: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
    // Does not necessarily exist for NEP-5 tokens
    admin_address_id: {
      type: ADDRESS_VALIDATOR,
      exposeGraphQL: true,
    },
    block_time: BLOCK_TIME_COLUMN,
    issued: {
      type: { type: 'decimal', minimum: 0, default: '0' },
      required: true,
      exposeGraphQL: true,
    },
    available: {
      type: { type: 'decimal', minimum: 0, default: '0' },
      graphqlResolver: async (obj, args, context) => {
        if (obj.available != null) {
          return obj.available;
        }

        if (obj.transaction_id === GAS_ASSET_HASH) {
          const maxIndex = await context.rootLoader.maxIndexFetcher.get();
          return calculateAvailableGAS(maxIndex);
        }

        return obj.issued;
      },
      required: true,
      exposeGraphQL: true,
      computed: true,
    },
    address_count: {
      type: { type: 'bigInteger', minimum: 0, default: '0' },
      required: true,
      exposeGraphQL: true,
    },
    transaction_count: {
      type: { type: 'bigInteger', minimum: 0, default: '0' },
      required: true,
      exposeGraphQL: true,
    },
    transfer_count: {
      type: { type: 'bigInteger', minimum: 0, default: '0' },
      required: true,
      exposeGraphQL: true,
    },
  };

  static edgeSchema: EdgeSchema = {
    coins: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Coin').default;
        },
        join: {
          from: 'asset.id',
          to: 'coin.asset_id',
        },
      },
      exposeGraphQL: true,
    },
    transaction_input_outputs: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./TransactionInputOutput').default;
        },
        join: {
          from: 'asset.id',
          to: 'transaction_input_output.asset_id',
        },
      },
      exposeGraphQL: true,
    },
    admin_address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Address').default;
        },
        join: {
          from: 'asset.admin_address_id',
          to: 'address.id',
        },
      },
      exposeGraphQL: true,
    },
    register_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'asset.transaction_id',
          to: 'transaction.id',
        },
      },
      exposeGraphQL: true,
      required: true,
    },
    transactions: {
      relation: {
        relation: Model.ManyToManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'asset.id',
          through: {
            get modelClass() {
              // eslint-disable-next-line
              return require('./AssetToTransaction').default;
            },
            from: 'asset_to_transaction.id1',
            to: 'asset_to_transaction.id2',
          },
          to: 'transaction.id',
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
          from: 'asset.id',
          to: 'transfer.asset_id',
        },
      },
      exposeGraphQL: true,
    },
  };
}
