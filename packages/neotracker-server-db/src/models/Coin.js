/* @flow */
import { Model } from 'objection';

import {
  ADDRESS_VALIDATOR,
  ASSET_HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
} from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

export default class Coin extends BlockchainModel {
  static modelName = 'Coin';
  static indices = [
    {
      type: 'simple',
      columnNames: ['address_id', 'asset_id'],
      name: 'coin_primary',
      unique: true,
    },
    {
      type: 'simple',
      columnNames: ['asset_id'],
      name: 'coin_asset',
    },
    {
      type: 'simple',
      columnNames: ['value', 'id'],
      name: 'coin_value_id',
    },
    {
      type: 'order',
      columns: [
        {
          name: 'asset_id',
          order: 'desc',
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
      name: 'coin_asset_value_id',
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
      CREATE TRIGGER coin_update_tables AFTER INSERT
      ON coin FOR EACH ROW EXECUTE PROCEDURE
      coin_update_tables()
    `);
  }

  static fieldSchema: FieldSchema = {
    address_hash: {
      type: ADDRESS_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    address_id: {
      type: { type: 'foreignID', modelType: 'Address' },
      required: true,
      exposeGraphQL: true,
    },
    asset_hash: {
      type: ASSET_HASH_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    asset_id: {
      type: { type: 'foreignID', modelType: 'Asset' },
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
