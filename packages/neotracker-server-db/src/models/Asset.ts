// tslint:disable variable-name
import { GAS_ASSET_HASH } from '@neotracker/shared-utils';
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { calculateAvailableGAS } from '../utils';
import { BlockchainModel } from './BlockchainModel';
import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
  BIG_INT_ID,
  BLOCK_ID_VALIDATOR,
  BLOCK_TIME_COLUMN,
  HASH_VALIDATOR,
  NEP5_CONTRACT_TYPE,
} from './common';
import { convertJSON } from './convertJSON';

export const ASSET_TYPES: ReadonlyArray<string> = [
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

export class Asset extends BlockchainModel<string> {
  public static readonly modelName = 'Asset';
  public static readonly exposeGraphQL: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
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
  public static readonly fieldSchema: FieldSchema = {
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
      graphqlResolver: async (obj) => {
        if (obj.name != undefined) {
          return obj.name;
        }

        try {
          const result = typeof obj.name_raw === 'string' ? JSON.parse(obj.name_raw) : obj.name_raw;

          if (typeof result === 'string') {
            return [
              {
                lang: 'en',
                name: result,
              },
            ];
          }

          return result;
        } catch {
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
      type: { type: 'decimal', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    available: {
      type: { type: 'decimal', minimum: 0 },
      graphqlResolver: async (obj, _args, context) => {
        if (obj.available != undefined) {
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
      type: { type: 'bigInteger', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    transaction_count: {
      type: { type: 'bigInteger', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    transfer_count: {
      type: { type: 'bigInteger', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    aggregate_block_id: {
      type: BLOCK_ID_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
  };
  public static readonly edgeSchema: EdgeSchema = {
    coins: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Coin').Coin;
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
          // tslint:disable-next-line no-require-imports
          return require('./TransactionInputOutput').TransactionInputOutput;
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
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
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
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
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
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
        },
        join: {
          from: 'asset.id',
          through: {
            get modelClass() {
              // tslint:disable-next-line no-require-imports
              return require('./AssetToTransaction').AssetToTransaction;
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
          // tslint:disable-next-line no-require-imports
          return require('./Transfer').Transfer;
        },
        join: {
          from: 'asset.id',
          to: 'transfer.asset_id',
        },
      },
      exposeGraphQL: true,
    },
  };
  public static async insertAll(db: Knex, context: QueryContext, data: ReadonlyArray<Partial<Asset>>): Promise<void> {
    return this.insertAllBase(db, context, data, Asset);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        transaction_id: convertJSON(json.transaction_id),
        amount: convertJSON(json.amount),
        issued: convertJSON(json.issued),
        address_count: convertJSON(json.address_count),
        transaction_count: convertJSON(json.transaction_count),
        transfer_count: convertJSON(json.transfer_count),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly transaction_id!: string;
  public readonly transaction_hash!: string;
  public readonly type!: string;
  public readonly name_raw!: string;
  public readonly symbol!: string;
  public readonly amount!: string;
  public readonly precision!: number;
  public readonly owner!: string | null | undefined;
  public readonly admin_address_id!: string | null | undefined;
  public readonly block_time!: number;
  public readonly issued!: string;
  public readonly address_count!: string;
  public readonly transaction_count!: string;
  public readonly transfer_count!: string;
  public readonly aggregate_block_id!: number;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.transaction_id = convertJSON(this.transaction_id);
    // @ts-ignore
    this.amount = convertJSON(this.amount);
    // @ts-ignore
    this.issued = convertJSON(this.issued);
    // @ts-ignore
    this.address_count = convertJSON(this.address_count);
    // @ts-ignore
    this.transaction_count = convertJSON(this.transaction_count);
    // @ts-ignore
    this.transfer_count = convertJSON(this.transfer_count);
    // tslint:enable no-object-mutation
  }
}
