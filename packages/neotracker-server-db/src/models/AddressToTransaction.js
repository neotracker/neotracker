/* @flow */
import { BaseEdge, type BaseModel } from '../lib';

export default class AddressToTransaction extends BaseEdge<string, string> {
  static modelName = 'AddressToTransaction';
  static id2Desc = true;

  static chainCustomAfter(schema: any): any {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION address_to_transaction_update_tables() RETURNS trigger AS $address_to_transaction_update_tables$
        BEGIN
          UPDATE address
          SET transaction_count=transaction_count + a.cnt
          FROM (
            SELECT id1, COUNT(1) AS cnt
            FROM new_address_to_transaction
            GROUP BY id1
          ) a
          WHERE address.id = a.id1;
          RETURN NULL;
        END;
      $address_to_transaction_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS address_to_transaction_update_tables
      ON address_to_transaction;

      CREATE TRIGGER address_to_transaction_update_tables
      AFTER INSERT ON address_to_transaction
      REFERENCING NEW TABLE AS new_address_to_transaction
      FOR EACH STATEMENT EXECUTE PROCEDURE
      address_to_transaction_update_tables();
    `);
  }

  static get id1Type(): Class<BaseModel<string>> {
    // eslint-disable-next-line
    return require('./Address').default;
  }

  static get id2Type(): Class<BaseModel<string>> {
    // eslint-disable-next-line
    return require('./Transaction').default;
  }
}
