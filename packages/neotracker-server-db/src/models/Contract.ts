// tslint:disable variable-name
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import {
  BIG_INT_ID,
  BLOCK_TIME_COLUMN,
  CONTRACT_VALIDATOR,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
  NEP5_BLACKLIST_CONTRACT_TYPE,
  NEP5_CONTRACT_TYPE,
  UNKNOWN_CONTRACT_TYPE,
} from './common';
import { convertJSON, convertJSONBoolean } from './convertJSON';

export class Contract extends BlockchainModel<string> {
  public static readonly modelName = 'Contract';
  public static readonly exposeGraphQL: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    // ContractSearch
    {
      type: 'order',
      columns: [
        {
          name: 'block_id',
          order: 'desc',
        },

        {
          name: 'id',
          order: 'desc',
        },
      ],

      name: 'contract_block_id_id',
    },
  ];
  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: CONTRACT_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },

    script: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    parameters_raw: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    return_type: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    needs_storage: {
      type: { type: 'boolean' },
      required: true,
      exposeGraphQL: true,
    },

    name: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    version: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    author: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    email: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    description: {
      type: { type: 'string' },
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

    block_time: BLOCK_TIME_COLUMN,
    block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },

    type: {
      type: {
        type: 'string',
        enum: [NEP5_CONTRACT_TYPE, NEP5_BLACKLIST_CONTRACT_TYPE, UNKNOWN_CONTRACT_TYPE],
      },

      required: true,
      exposeGraphQL: true,
    },
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
          from: 'contract.transaction_id',
          to: 'transaction.id',
        },
      },

      exposeGraphQL: true,
      required: true,
    },

    transfers: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transfer').Transfer;
        },
        join: {
          from: 'contract.id',
          to: 'transfer.contract_id',
        },
      },

      exposeGraphQL: true,
    },
  };

  public static async insertAll(
    db: Knex,
    context: QueryContext,
    data: ReadonlyArray<Partial<Contract>>,
  ): Promise<void> {
    return this.insertAllBase(db, context, data, Contract);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        transaction_id: convertJSON(json.transaction_id),
        needs_storage: convertJSONBoolean(json.needs_storage),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly script!: string;
  public readonly parameters_raw!: string;
  public readonly return_type!: string;
  public readonly needs_storage!: boolean;
  public readonly name!: string;
  public readonly version!: string;
  public readonly author!: string;
  public readonly email!: string;
  public readonly description!: string;
  public readonly transaction_id!: string;
  public readonly transaction_hash!: string;
  public readonly block_time!: number;
  public readonly block_id!: number;
  public readonly type!: string;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.transaction_id = convertJSON(this.transaction_id);
    // @ts-ignore
    // tslint:disable-next-line no-redundant-boolean
    this.needs_storage = convertJSONBoolean(this.needs_storage);
    // tslint:enable no-object-mutation
  }
}
