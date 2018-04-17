/* @flow */
import { BaseEdge, type BaseModel } from '../lib';

export default class AssetToTransaction extends BaseEdge<string, string> {
  static modelName = 'AssetToTransaction';

  static chainCustomAfter(schema: any): any {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION asset_to_transaction_update_tables() RETURNS trigger AS $asset_to_transaction_update_tables$
        BEGIN
          UPDATE asset
          SET transaction_count=transaction_count + a.cnt
          FROM (
            SELECT id1, COUNT(1) AS cnt
            FROM new_asset_to_transaction
            GROUP BY id1
          ) a
          WHERE asset.id = a.id1;
          RETURN NULL;
        END;
      $asset_to_transaction_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS asset_to_transaction_update_tables
      ON asset_to_transaction;

      CREATE TRIGGER asset_to_transaction_update_tables
      AFTER INSERT ON asset_to_transaction
      REFERENCING NEW TABLE AS new_asset_to_transaction
      FOR EACH STATEMENT EXECUTE PROCEDURE
      asset_to_transaction_update_tables();
    `);
  }

  static get id1Type(): Class<BaseModel<string>> {
    // eslint-disable-next-line
    return require('./Asset').default;
  }

  static get id2Type(): Class<BaseModel<string>> {
    // eslint-disable-next-line
    return require('./Transaction').default;
  }
}
