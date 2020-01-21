// tslint:disable variable-name no-useless-cast
import { GAS_ASSET_ID } from '@neotracker/shared-utils';
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { calculateAddressClaimValue } from '../utils';
import { BlockchainModel } from './BlockchainModel';
import {
  ADDRESS_VALIDATOR,
  BIG_INT_ID,
  BLOCK_ID_VALIDATOR,
  BLOCK_TIME_COLUMN,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
} from './common';
import { convertJSON } from './convertJSON';

export class Address extends BlockchainModel<string> {
  public static readonly modelName = 'Address';
  public static get pluralName(): string {
    return 'Addresses';
  }
  public static readonly exposeGraphQL: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    // AddressSearch
    {
      type: 'order',
      columns: [
        {
          name: 'block_id',
          order: 'desc',
        },

        {
          name: 'id',
          order: 'asc',
        },
      ],

      name: 'address_block_id_id',
    },
  ];
  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: ADDRESS_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    transaction_id: {
      type: BIG_INT_ID,
      exposeGraphQL: true,
    },
    transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
    },
    block_time: BLOCK_TIME_COLUMN,
    transaction_count: {
      type: { type: 'bigInteger' as 'bigInteger', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    transfer_count: {
      type: { type: 'bigInteger' as 'bigInteger', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },
    aggregate_block_id: {
      type: BLOCK_ID_VALIDATOR,
      required: true,
    },
    last_transaction_id: {
      type: BIG_INT_ID,
      exposeGraphQL: true,
    },
    last_transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },
    last_transaction_time: {
      type: { type: 'integer' as 'integer', minimum: 0 },
      exposeGraphQL: true,
    },
    claim_value_available_coin: {
      type: { type: 'model' as 'model', modelType: 'Coin' },
      graphqlResolver: async (obj, _args, context, info) => {
        if (obj.claim_value_available_coin != undefined) {
          return obj.claim_value_available_coin;
        }

        const [asset, value] = await Promise.all([
          context.rootLoader.loaders.asset.load({
            // tslint:disable-next-line no-any
            id: GAS_ASSET_ID as any,
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
          // tslint:disable-next-line no-require-imports
          return require('./TransactionInputOutput').TransactionInputOutput;
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
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
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
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
        },
        join: {
          from: 'address.id',
          through: {
            get modelClass() {
              // tslint:disable-next-line no-require-imports
              return require('./AddressToTransaction').AddressToTransaction;
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
          // tslint:disable-next-line no-require-imports
          return require('./Transfer').Transfer;
        },
        join: {
          from: 'address.id',
          through: {
            get modelClass() {
              // tslint:disable-next-line no-require-imports
              return require('./AddressToTransfer').AddressToTransfer;
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
  public static async insertAll(db: Knex, context: QueryContext, data: ReadonlyArray<Partial<Address>>): Promise<void> {
    return this.insertAllBase(db, context, data, Address);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        transaction_id: convertJSON(json.transaction_id),
        transaction_count: convertJSON(json.transaction_count),
        transfer_count: convertJSON(json.transfer_count),
        last_transaction_id: convertJSON(json.last_transaction_id),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly transaction_id!: string | null | undefined;
  public readonly transaction_hash!: string | null | undefined;
  public readonly block_id!: number;
  public readonly block_time!: number;
  public readonly transaction_count!: string;
  public readonly transfer_count!: string;
  public readonly aggregate_block_id!: number;
  public readonly last_transaction_id!: string | null | undefined;
  public readonly last_transaction_time!: number | null | undefined;
  public readonly last_transaction_hash!: string | null | undefined;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.transaction_id = convertJSON(this.transaction_id);
    // @ts-ignore
    this.transaction_count = convertJSON(this.transaction_count);
    // @ts-ignore
    this.transfer_count = convertJSON(this.transfer_count);
    // @ts-ignore
    this.last_transaction_id = convertJSON(this.last_transaction_id);
    // tslint:enable no-object-mutation
  }
}
