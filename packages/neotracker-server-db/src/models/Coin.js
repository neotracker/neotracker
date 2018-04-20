/* @flow */
import { Model } from 'objection';

import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
} from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

export default class Coin extends BlockchainModel<string> {
  id: string;
  address_id: string;
  asset_id: string;
  value: string;
  block_index: number;
  transaction_index: number;
  action_index: number;

  static modelName = 'Coin';
  static indices = [
    // AssetAddressPagingView
    {
      type: 'order',
      columns: [
        {
          name: 'asset_id',
          order: 'asc nulls last',
        },
        {
          name: 'value',
          order: 'desc nulls first',
        },
        {
          name: 'id',
          order: 'desc nulls first',
        },
      ],
      name: 'coin_asset_value_id',
    },
    // TODO: Figure out where these queries are
    {
      type: 'order',
      columns: [
        {
          name: 'address_id',
          order: 'asc nulls last',
        },
      ],
      name: 'coin_address_id',
    },
  ];
  static bigIntID = true;

  static chainCustomAfter(schema: any): any {
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

  static makeID({
    addressHash,
    assetHash,
  }: {|
    addressHash: string,
    assetHash: string,
  |}): string {
    return [addressHash, assetHash].join('$');
  }

  static fieldSchema: FieldSchema = {
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
    block_index: {
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
  };

  static edgeSchema: EdgeSchema = {
    address: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Address').default;
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
          // eslint-disable-next-line
          return require('./Asset').default;
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
}
