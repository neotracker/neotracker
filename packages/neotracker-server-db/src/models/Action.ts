// tslint:disable variable-name no-useless-cast
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import { BIG_INT_ID, CONTRACT_VALIDATOR, HASH_VALIDATOR, INTEGER_INDEX_VALIDATOR } from './common';
import { convertJSON } from './convertJSON';

const ACTION_TYPES: ReadonlyArray<ActionType> = ['Log', 'Notification'];
export type ActionType = 'Log' | 'Notification';

export class Action extends BlockchainModel<string> {
  public static readonly modelName = 'Action';
  public static readonly exposeGraphQL: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    // TransactionActionPagingTable
    {
      type: 'order',
      columns: [
        {
          name: 'transaction_id',
          order: 'desc',
        },

        {
          name: 'index',
          order: 'asc',
        },
      ],

      name: 'action_transaction_id_index',
      unique: true,
    },
  ];
  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: BIG_INT_ID,
      required: true,
      exposeGraphQL: true,
    },
    type: {
      type: { type: 'string' as 'string', enum: ACTION_TYPES },
      required: true,
      exposeGraphQL: true,
    },
    block_id: {
      type: INTEGER_INDEX_VALIDATOR,
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
    transaction_index: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    index: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    script_hash: {
      type: CONTRACT_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    message: {
      type: { type: 'string' as 'string' },
      exposeGraphQL: true,
    },
    args_raw: {
      type: { type: 'string' as 'string' },
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
          from: 'action.transaction_id',
          to: 'transaction.id',
        },
      },
      required: true,
      exposeGraphQL: true,
    },
    transfer: {
      relation: {
        relation: Model.HasOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transfer').Transfer;
        },
        join: {
          from: 'action.id',
          to: 'transfer.id',
        },
      },
      exposeGraphQL: true,
    },
  };

  public static async insertAll(
    db: Knex,
    context: QueryContext,
    values: ReadonlyArray<Partial<Action>>,
  ): Promise<void> {
    return this.insertAllBase(db, context, values, Action);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        id: convertJSON(json.id),
        transaction_id: convertJSON(json.transaction_id),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly type!: string;
  public readonly block_id!: number;
  public readonly transaction_id!: string;
  public readonly transaction_hash!: string;
  public readonly transaction_index!: number;
  public readonly index!: number;
  public readonly script_hash!: string;
  public readonly message!: string | undefined | null;
  public readonly args_raw!: string | undefined | null;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.id = convertJSON(this.id);
    // @ts-ignore
    this.transaction_id = convertJSON(this.transaction_id);
    // tslint:enable no-object-mutation
  }
}
