// tslint:disable variable-name
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import {
  BIG_INT_ID,
  BLOCK_TIME_COLUMN,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
  SUBTYPE_ENROLLMENT,
  TYPE_DUPLICATE_CLAIM,
  TYPE_INPUT,
} from './common';
import { convertJSON } from './convertJSON';

export const TRANSACTION_TYPES: ReadonlyArray<string> = [
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

export class Transaction extends BlockchainModel<string> {
  public static readonly modelName = 'Transaction';
  public static readonly exposeGraphQL: boolean = true;
  public static readonly idDesc: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
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

  public static readonly fieldSchema: FieldSchema = {
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

      graphqlResolver: async (obj) => {
        if (obj.scripts != undefined) {
          return obj.scripts;
        }

        return typeof obj.scripts_raw === 'string' ? JSON.parse(obj.scripts_raw) : obj.scripts_raw;
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
  public static readonly edgeSchema: EdgeSchema = {
    inputs: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./TransactionInputOutput').TransactionInputOutput;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.input_transaction_id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },

      exposeGraphQL: true,
    },
    outputs: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./TransactionInputOutput').TransactionInputOutput;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.output_transaction_id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },

      exposeGraphQL: true,
    },
    enrollment: {
      relation: {
        relation: Model.HasOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./TransactionInputOutput').TransactionInputOutput;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.output_transaction_id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.subtype', SUBTYPE_ENROLLMENT),
      },

      exposeGraphQL: true,
    },
    claims: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./TransactionInputOutput').TransactionInputOutput;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.claim_transaction_id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },

      exposeGraphQL: true,
    },
    duplicate_claims: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./TransactionInputOutput').TransactionInputOutput;
        },
        join: {
          from: 'transaction.id',
          to: 'transaction_input_output.claim_transaction_id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.type', TYPE_DUPLICATE_CLAIM),
      },

      exposeGraphQL: true,
    },
    asset: {
      relation: {
        relation: Model.HasOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Asset').Asset;
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
          // tslint:disable-next-line no-require-imports
          return require('./Block').Block;
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
          // tslint:disable-next-line no-require-imports
          return require('./Contract').Contract;
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
          // tslint:disable-next-line no-require-imports
          return require('./Action').Action;
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
          // tslint:disable-next-line no-require-imports
          return require('./Transfer').Transfer;
        },
        join: {
          from: 'transaction.id',
          to: 'transfer.transaction_id',
        },
      },

      exposeGraphQL: true,
    },
  };

  public static async insertAll(
    db: Knex,
    context: QueryContext,
    values: ReadonlyArray<Partial<Transaction>>,
  ): Promise<void> {
    return this.insertAllBase(db, context, values, Transaction);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        id: convertJSON(json.id),
        system_fee: convertJSON(json.system_fee),
        network_fee: convertJSON(json.network_fee),
        nonce: convertJSON(json.nonce),
        gas: convertJSON(json.gas),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly hash!: string;
  public readonly type!: string;
  public readonly size!: number;
  public readonly version!: number;
  public readonly attributes_raw!: string;
  public readonly system_fee!: string;
  public readonly network_fee!: string;
  public readonly nonce!: string | undefined | null;
  public readonly pubkey!: string | undefined | null;
  public readonly block_id!: number;
  public readonly block_time!: number;
  public readonly index!: number;
  public readonly scripts_raw!: string;
  public readonly script!: string | undefined | null;
  public readonly gas!: string | undefined | null;
  public readonly result_raw!: string | undefined | null;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.id = convertJSON(this.id);
    // @ts-ignore
    this.system_fee = Number(this.system_fee).toFixed(8);
    // @ts-ignore
    this.network_fee = Number(this.network_fee).toFixed(8);
    // @ts-ignore
    this.nonce = convertJSON(this.nonce);
    // @ts-ignore
    this.gas = convertJSON(this.gas);
    // tslint:enable no-object-mutation
  }
}
