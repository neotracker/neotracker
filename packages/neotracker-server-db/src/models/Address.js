/* @flow */
import { GAS_ASSET_ID } from 'neotracker-shared-utils';
import type { GraphQLResolveInfo } from 'graphql';
import { Model } from 'objection';

import { ADDRESS_VALIDATOR, BLOCK_TIME_COLUMN, HASH_VALIDATOR } from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';
import type { GraphQLContext } from '../types';

import { calculateAddressClaimValue } from '../utils';

export default class Address extends BlockchainModel<string> {
  id: string;
  transaction_id: string;
  block_time: number;
  transaction_count: string;
  transfer_count: string;
  last_transaction_id: string;
  last_transaction_time: number;
  name: string;
  name_url: string;
  verified: boolean;

  static modelName = 'Address';
  static get pluralName(): string {
    return 'Addresses';
  }
  static exposeGraphQL: boolean = true;
  static indices = [
    // AddressSearch
    {
      type: 'order',
      columns: [
        {
          name: 'block_time',
          order: 'DESC NULLS FIRST',
        },
        {
          name: 'id',
          order: 'DESC NULLS LAST',
        },
      ],
      name: 'address_block_time_id',
    },
  ];
  static bigIntID = true;

  static fieldSchema: FieldSchema = {
    id: {
      type: ADDRESS_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    transaction_id: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    block_time: BLOCK_TIME_COLUMN,
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
    last_transaction_id: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    last_transaction_time: {
      type: { type: 'integer', minimum: 0 },
      exposeGraphQL: true,
    },
    claim_value_available_coin: {
      type: { type: 'model', modelType: 'Coin' },
      graphqlResolver: async (
        obj: any,
        args: Object,
        context: GraphQLContext,
        info: GraphQLResolveInfo,
      ) => {
        if (obj.claim_value_available_coin != null) {
          return obj.claim_value_available_coin;
        }

        const [asset, value] = await Promise.all([
          context.rootLoader.loaders.asset.load({
            id: (GAS_ASSET_ID: $FlowFixMe),
            monitor: context.getMonitor(info),
          }),
          calculateAddressClaimValue(obj, context, info),
        ]);

        return {
          id: `-${obj.id}`,
          value,
          asset,
        };
      },
      computed: true,
      required: true,
      exposeGraphQL: true,
    },
    name: {
      type: { type: 'string', maxLength: 34 },
      required: true,
      exposeGraphQL: true,
    },
    name_url: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
    verified: {
      type: { type: 'boolean' },
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
          from: 'address.id',
          to: 'coin.address_id',
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
          from: 'address.id',
          to: 'transaction_input_output.address_id',
        },
      },
      exposeGraphQL: true,
    },
    first_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'address.transaction_id',
          to: 'transaction.id',
        },
      },
      exposeGraphQL: true,
    },
    transactions: {
      relation: {
        relation: Model.ManyToManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'address.id',
          through: {
            get modelClass() {
              // eslint-disable-next-line
              return require('./AddressToTransaction').default;
            },
            from: 'address_to_transaction.id1',
            to: 'address_to_transaction.id2',
          },
          to: 'transaction.id',
        },
      },
      exposeGraphQL: true,
    },
    transfers: {
      relation: {
        relation: Model.ManyToManyRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transfer').default;
        },
        join: {
          from: 'address.id',
          through: {
            get modelClass() {
              // eslint-disable-next-line
              return require('./AddressToTransfer').default;
            },
            from: 'address_to_transfer.id1',
            to: 'address_to_transfer.id2',
          },
          to: 'transfer.id',
        },
      },
      exposeGraphQL: true,
    },
  };
}
