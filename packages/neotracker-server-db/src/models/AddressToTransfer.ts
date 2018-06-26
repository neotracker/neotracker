// tslint:disable variable-name
import Knex from 'knex';
import { BaseEdge, BaseModel } from '../lib';

export class AddressToTransfer extends BaseEdge<string, string> {
  public static readonly modelName = 'AddressToTransfer';
  public static readonly id2Desc = true;

  public static chainCustomAfter(schema: Knex.SchemaBuilder): Knex.SchemaBuilder {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION address_to_transfer_update_tables() RETURNS trigger AS $address_to_transfer_update_tables$
        BEGIN
          UPDATE address
          SET transfer_count=transfer_count + a.cnt
          FROM (
            SELECT id1, COUNT(1) AS cnt
            FROM new_address_to_transfer
            GROUP BY id1
          ) a
          WHERE address.id = a.id1;
          RETURN NULL;
        END;
      $address_to_transfer_update_tables$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS address_to_transfer_update_tables
      ON address_to_transfer;

      CREATE TRIGGER address_to_transfer_update_tables
      AFTER INSERT ON address_to_transfer
      REFERENCING NEW TABLE AS new_address_to_transfer
      FOR EACH STATEMENT EXECUTE PROCEDURE
      address_to_transfer_update_tables();
    `);
  }

  public static get id1Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Address').Address;
  }

  public static get id2Type(): typeof BaseModel {
    // tslint:disable-next-line no-require-imports
    return require('./Transfer').Transfer;
  }
}
