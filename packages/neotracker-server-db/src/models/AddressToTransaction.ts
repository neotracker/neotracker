// tslint:disable variable-name
import Knex from 'knex';
import { BaseEdge, BaseModel } from '../lib';

export class AddressToTransaction extends BaseEdge<string, string> {
  public static readonly modelName = 'AddressToTransaction';
  public static readonly id2Desc = true;

  public static chainCustomAfter(schema: Knex.SchemaBuilder): Knex.SchemaBuilder {
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

  public static get id1Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Address').Address;
  }

  public static get id2Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Transaction').Transaction;
  }
}
