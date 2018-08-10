// tslint:disable variable-name
import Knex from 'knex';
import { Constructor, Model, ModelOptions, Pojo, QueryContext as ObjectionQueryContext } from 'objection';
import { isPostgres } from '../knexUtils';
import { EdgeSchema, FieldSchema, IndexSchema, QueryContext } from '../lib';
import { BlockchainModel } from './BlockchainModel';
import { ADDRESS_VALIDATOR, ASSET_HASH_VALIDATOR, BLOCK_ID_VALIDATOR } from './common';
import { convertJSON } from './convertJSON';

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
        {
          name: 'value',
          order: 'desc',
        },
        {
          name: 'id',
          order: 'desc',
        },
      ],

      name: 'coin_asset_id_value_id',
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
      type: BLOCK_ID_VALIDATOR,
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

  public static async insertAll(db: Knex, context: QueryContext, values: ReadonlyArray<Partial<Coin>>): Promise<void> {
    return this.insertAllBase(db, context, values, Coin);
  }

  public static async insertAndReturn(db: Knex, queryContext: QueryContext, block: Partial<Coin>): Promise<Coin> {
    if (isPostgres(db)) {
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

  public static fromJson<M>(this: Constructor<M>, json: Pojo, opt?: ModelOptions): M {
    return super.fromJson(
      {
        ...json,
        value: convertJSON(json.value),
      },
      opt,
      // tslint:disable-next-line no-any
    ) as any;
  }

  public readonly address_id!: string;
  public readonly asset_id!: string;
  public readonly value!: string;
  public readonly block_id!: number;

  public async $afterGet(context: ObjectionQueryContext): Promise<void> {
    await super.$afterGet(context);

    // tslint:disable no-object-mutation
    // @ts-ignore
    this.value = convertJSON(this.value);
    // tslint:enable no-object-mutation
  }
}
