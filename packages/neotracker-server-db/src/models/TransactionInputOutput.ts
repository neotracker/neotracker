// tslint:disable variable-name
import Knex from 'knex';
import { Model } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
  BIG_INT_ID,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
  SUBTYPE_CLAIM,
  SUBTYPE_ENROLLMENT,
  SUBTYPE_ISSUE,
  SUBTYPE_NONE,
  SUBTYPE_REWARD,
  TYPE_DUPLICATE_CLAIM,
  TYPE_INPUT,
} from './common';

// Always starts as an output
// May be used as an input in contract (where it subtracts from the owner)
// or a claim (where it does not subtract from the owner)
export class TransactionInputOutput extends BlockchainModel<string> {
  public static readonly modelName = 'TransactionInputOutput';
  public static readonly exposeGraphQL: boolean = true;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    // TransactionInputPagingTable
    {
      type: 'order',
      columns: [
        {
          name: 'input_transaction_id',
          order: 'desc',
        },

        {
          name: 'type',
          order: 'asc',
        },

        {
          name: 'output_transaction_index',
          order: 'asc',
        },
      ],

      name: 'tio_input_transaction_id_type_output_transaction_index',
    },

    // TransactionOutputPagingTable, run$
    {
      type: 'order',
      columns: [
        {
          name: 'output_transaction_id',
          order: 'desc',
        },

        {
          name: 'type',
          order: 'asc',
        },

        {
          name: 'output_transaction_index',
          order: 'asc',
        },
      ],

      name: 'tio_output_transaction_id_type_output_transaction_index',
    },

    // TransactionClaimPagingTable
    {
      type: 'order',
      columns: [
        {
          name: 'claim_transaction_id',
          order: 'desc',
        },

        {
          name: 'type',
          order: 'asc',
        },

        {
          name: 'output_transaction_index',
          order: 'asc',
        },
      ],

      name: 'tio_claim_transaction_id_type_output_transaction_index',
    },
    {
      type: 'order',
      columns: [
        {
          name: 'address_id',
          order: 'asc',
        },

        {
          name: 'asset_id',
          order: 'asc',
        },

        {
          name: 'claim_transaction_id',
          order: 'desc',
        },
      ],

      name: 'tio_address_id_asset_id_claim_transaction_id',
    },
  ];

  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    type: {
      type: { type: 'string', enum: [TYPE_INPUT, TYPE_DUPLICATE_CLAIM] },
      required: true,
      exposeGraphQL: true,
    },

    subtype: {
      type: {
        type: 'string',
        enum: [SUBTYPE_NONE, SUBTYPE_ISSUE, SUBTYPE_ENROLLMENT, SUBTYPE_CLAIM, SUBTYPE_REWARD],
      },

      required: true,
      exposeGraphQL: true,
    },

    input_transaction_id: {
      type: BIG_INT_ID,
      exposeGraphQL: true,
    },

    claim_transaction_id: {
      type: BIG_INT_ID,
      exposeGraphQL: true,
    },

    output_transaction_id: {
      type: BIG_INT_ID,
      required: true,
      exposeGraphQL: true,
    },

    input_transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },

    claim_transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
    },

    output_transaction_hash: {
      type: HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },

    output_transaction_index: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },

    output_block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },

    asset_id: {
      type: ASSET_HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },

    value: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },

    address_id: {
      type: ADDRESS_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },

    claim_value: {
      type: { type: 'decimal' },
      exposeGraphQL: true,
    },
  };
  public static readonly edgeSchema: EdgeSchema = {
    input_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
        },
        join: {
          from: 'transaction_input_output.input_transaction_id',
          to: 'transaction.id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },

      exposeGraphQL: true,
    },

    claim_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
        },
        join: {
          from: 'transaction_input_output.claim_transaction_id',
          to: 'transaction.id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.type', TYPE_INPUT),
      },

      exposeGraphQL: true,
    },

    duplicate_claim_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
        },
        join: {
          from: 'transaction_input_output.claim_transaction_id',
          to: 'transaction.id',
        },

        filter: (queryBuilder) => queryBuilder.where('transaction_input_output.type', TYPE_DUPLICATE_CLAIM),
      },

      exposeGraphQL: true,
    },

    output_transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Transaction').Transaction;
        },
        join: {
          from: 'transaction_input_output.output_transaction_id',
          to: 'transaction.id',
        },
      },

      exposeGraphQL: true,
      required: true,
    },

    asset: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Asset').Asset;
        },
        join: {
          from: 'transaction_input_output.asset_id',
          to: 'asset.id',
        },
      },

      exposeGraphQL: true,
      required: true,
    },

    address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
        },
        join: {
          from: 'transaction_input_output.address_id',
          to: 'address.id',
        },
      },

      exposeGraphQL: true,
      required: true,
    },
  };

  public static chainCustomAfter(schema: Knex.SchemaBuilder): Knex.SchemaBuilder {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION txio_update_tables() RETURNS trigger AS $txio_update_tables$
        BEGIN
          UPDATE asset
          SET issued=issued + NEW.value
          WHERE asset.id = NEW.asset_id;
          RETURN NULL;
        END;
      $txio_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS txio_update_tables
      ON transaction_input_output;

      CREATE TRIGGER txio_update_tables AFTER INSERT
      ON transaction_input_output FOR EACH ROW
      WHEN (
        NEW.type = '${TYPE_INPUT}' AND
        NEW.input_transaction_id IS NULL AND (
          NEW.subtype = '${SUBTYPE_ISSUE}' OR
          NEW.subtype = '${SUBTYPE_CLAIM}' OR
          NEW.subtype = '${SUBTYPE_REWARD}'
        )
      )
      EXECUTE PROCEDURE txio_update_tables()
    `);
  }

  public static makeID({
    outputTransactionHash,
    outputTransactionIndex,
    type,
  }: {
    readonly outputTransactionHash: string;
    readonly outputTransactionIndex: number;
    readonly type: string;
  }): string {
    return [outputTransactionHash, outputTransactionIndex, type].join('$');
  }

  public readonly type!: string;
  public readonly subtype!: string;
  public readonly input_transaction_id!: string | undefined;
  public readonly input_transaction_hash!: string | undefined;
  public readonly claim_transaction_id!: string | undefined;
  public readonly claim_transaction_hash!: string | undefined;
  public readonly output_transaction_id!: string;
  public readonly output_transaction_hash!: string;
  public readonly output_transaction_index!: number;
  public readonly output_block_id!: number;
  public readonly asset_id!: string;
  public readonly value!: string;
  public readonly address_id!: string;
  public readonly claim_value!: string | null | undefined;
}
