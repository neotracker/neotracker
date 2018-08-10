// tslint:disable variable-name
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { isPostgres } from '../knexUtils';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import {
  ADDRESS_VALIDATOR,
  BLOCK_TIME_VALIDATOR,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
  NONCE_VALIDATOR,
} from './common';
import { convertJSON } from './convertJSON';

export class Block extends BlockchainModel<number> {
  public static readonly modelName = 'Block';
  public static readonly exposeGraphQL: boolean = true;
  // Home, BlockSearch
  public static readonly idDesc: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    // Block
    {
      type: 'order',
      columns: [
        {
          name: 'hash',
          order: 'asc',
        },
      ],

      name: 'block_hash',
    },
  ];
  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },

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

    nonce: {
      type: NONCE_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },

    validator_address_id: {
      type: ADDRESS_VALIDATOR,
      exposeGraphQL: true,
    },

    next_validator_address_id: {
      type: ADDRESS_VALIDATOR,
      required: true,
      exposeGraphQL: true,
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

    transaction_count: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },

    previous_block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
    },

    previous_block_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },

    next_block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
    },

    next_block_hash: {
      type: HASH_VALIDATOR,
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

      graphqlResolver: async (obj) => {
        if (obj.script != undefined) {
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
  public static readonly edgeSchema: EdgeSchema = {
    transactions: {
      relation: {
        relation: Model.HasManyRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
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
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
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
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
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
          // tslint:disable-next-line no-require-imports
          return require('./Block').Block;
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
          // tslint:disable-next-line no-require-imports
          return require('./Block').Block;
        },
        join: {
          from: 'block.next_block_id',
          to: 'block.id',
        },
      },
    },
  };

  public static async insertAndReturn(db: Knex, queryContext: QueryContext, block: Partial<Block>): Promise<Block> {
    if (isPostgres(db)) {
      return Block.query(db)
        .context(queryContext)
        .insert(block)
        .returning('*')
        .first()
        .throwIfNotFound();
    }

    return Block.query(db)
      .context(queryContext)
      .insertAndFetch(block);
  }

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        system_fee: convertJSON(json.system_fee),
        network_fee: convertJSON(json.network_fee),
        aggregated_system_fee: convertJSON(json.aggregated_system_fee),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly hash!: string;
  public readonly size!: number;
  public readonly version!: number;
  public readonly merkle_root!: string;
  public readonly time!: number;
  public readonly nonce!: string;
  public readonly validator_address_id!: string | null | undefined;
  public readonly next_validator_address_id!: string;
  public readonly invocation_script!: string;
  public readonly verification_script!: string;
  public readonly transaction_count!: number;
  public readonly previous_block_id!: number | null | undefined;
  public readonly previous_block_hash!: string | null | undefined;
  public readonly next_block_id!: number | null | undefined;
  public readonly next_block_hash!: string | null | undefined;
  public readonly system_fee!: string;
  public readonly network_fee!: string;
  public readonly aggregated_system_fee!: string;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.system_fee = Number(this.system_fee).toFixed(8);
    // @ts-ignore
    this.network_fee = Number(this.network_fee).toFixed(8);
    // @ts-ignore
    this.aggregated_system_fee = Number(this.aggregated_system_fee).toFixed(8);
    // tslint:enable no-object-mutation
  }
}
