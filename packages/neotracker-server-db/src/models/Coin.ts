// tslint:disable variable-name
import Knex from 'knex';
import { Model } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import { ADDRESS_VALIDATOR, ASSET_HASH_VALIDATOR } from './common';

export class Coin extends BlockchainModel<string> {
  public static readonly modelName = 'Coin';
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    // AssetAddressPagingView
    {
      type: 'order',
      columns: [
        {
          name: 'asset_id',
          order: 'asc',
        },
      ],

      name: 'coin_asset_id',
    },

    // AddressView, SendTransaction, AccountViewBase
    {
      type: 'order',
      columns: [
        {
          name: 'address_id',
          order: 'asc',
        },
      ],

      name: 'coin_address_id',
    },
  ];
  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: { type: 'string' },
      required: true,
      exposeGraphQL: true,
    },

    address_id: {
      type: ADDRESS_VALIDATOR,
      required: true,
      exposeGraphQL: true,
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

    block_id: {
      type: { type: 'integer', minimum: -1 },
      required: true,
    },

    transaction_index: {
      type: { type: 'integer', minimum: -1 },
      required: true,
    },

    action_index: {
      type: { type: 'integer', minimum: -1 },
      required: true,
    },
  };
  public static readonly edgeSchema: EdgeSchema = {
    address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // tslint:disable-next-line no-require-imports
          return require('./Address').Address;
        },
        join: {
          from: 'coin.address_id',
          to: 'address.id',
        },
      },

      required: true,
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
          from: 'coin.asset_id',
          to: 'asset.id',
        },
      },

      required: true,
      exposeGraphQL: true,
    },
  };

  public static chainCustomAfter(schema: Knex.SchemaBuilder): Knex.SchemaBuilder {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION coin_update_tables() RETURNS trigger AS $coin_update_tables$
        BEGIN
          UPDATE asset
          SET address_count=address_count + 1
          WHERE asset.id = NEW.asset_id;
          RETURN NULL;
        END;
      $coin_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS coin_update_tables
      ON coin;

      CREATE TRIGGER coin_update_tables AFTER INSERT
      ON coin FOR EACH ROW EXECUTE PROCEDURE
      coin_update_tables()
    `);
  }

  public static makeID({
    addressHash,
    assetHash,
  }: {
    readonly addressHash: string;
    readonly assetHash: string;
  }): string {
    return [addressHash, assetHash].join('$');
  }

  public readonly address_id!: string;
  public readonly asset_id!: string;
  public readonly value!: string;
  public readonly block_id!: number;
  public readonly transaction_index!: number;
  public readonly action_index!: number;
}
