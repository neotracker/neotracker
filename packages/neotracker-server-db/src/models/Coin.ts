// tslint:disable variable-name
import Knex from 'knex';
import { Model } from 'objection';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
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

  public static makeID({
    addressHash,
    assetHash,
  }: {
    readonly addressHash: string;
    readonly assetHash: string;
  }): string {
    return [addressHash, assetHash].join('$');
  }

  public static async insertAndReturn(db: Knex, queryContext: QueryContext, block: Partial<Coin>): Promise<Coin> {
    if (db.client.driverName === 'pg') {
      return Coin.query(db)
        .context(queryContext)
        .insert(block)
        .returning('*')
        .first()
        .throwIfNotFound();
    }

    return Coin.query(db)
      .context(queryContext)
      .insertAndFetch(block);
  }

  public readonly address_id!: string;
  public readonly asset_id!: string;
  public readonly value!: string;
  public readonly block_id!: number;
  public readonly transaction_index!: number;
  public readonly action_index!: number;
}
