// tslint:disable variable-name
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
  BIG_INT_ID,
  BLOCK_TIME_COLUMN,
  CONTRACT_VALIDATOR,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
} from './common';
import { convertJSON } from './convertJSON';

export class Transfer extends BlockchainModel<string> {
  public static readonly modelName = 'Transfer';
  public static readonly exposeGraphQL: boolean = true;
  public static readonly idDesc: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
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

  public static readonly fieldSchema: FieldSchema = {
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
  public static readonly edgeSchema: EdgeSchema = {
    transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
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
          // tslint:disable-next-line no-require-imports
          return require('./Asset').Asset;
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
          // tslint:disable-next-line no-require-imports
          return require('./Action').Action;
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
          // tslint:disable-next-line no-require-imports
          return require('./Contract').Contract;
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
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
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
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
        },
        join: {
          from: 'transfer.to_address_id',
          to: 'address.id',
        },
      },

      exposeGraphQL: true,
    },

    addresses: {
      relation: {
        relation: Model.ManyToManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
        },
        join: {
          from: 'transfer.id',
          through: {
            get modelClass() {
              // tslint:disable-next-line no-require-imports
              return require('./AddressToTransfer').AddressToTransfer;
            },
            from: 'address_to_transfer.id2',
            to: 'address_to_transfer.id1',
          },

          to: 'address.id',
        },
      },

      exposeGraphQL: true,
    },
  };

  public static async insertAll(
    db: Knex,
    context: QueryContext,
    values: ReadonlyArray<Partial<Transfer>>,
  ): Promise<void> {
    return this.insertAllBase(db, context, values, Transfer);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        id: convertJSON(json.id),
        transaction_id: convertJSON(json.transaction_id),
        value: convertJSON(json.value),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly transaction_id!: string;
  public readonly transaction_hash!: string;
  public readonly asset_id!: string;
  public readonly contract_id!: string;
  public readonly value!: string;
  public readonly from_address_id!: string | null | undefined;
  public readonly to_address_id!: string | null | undefined;
  public readonly block_id!: number;
  public readonly transaction_index!: number;
  public readonly action_index!: number;
  public readonly block_time!: number;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.id = convertJSON(this.id);
    // @ts-ignore
    this.transaction_id = convertJSON(this.transaction_id);
    // @ts-ignore
    this.value = convertJSON(this.value);
    // tslint:enable no-object-mutation
  }
}
