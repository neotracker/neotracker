/* @flow */
import { BaseEdge, type BaseModel } from '../lib';

export default class AddressToTransfer extends BaseEdge {
  static modelName = 'AddressToTransfer';
  static indices = [
    {
      type: 'order',
      columns: [
        {
          name: 'id2',
          order: 'DESC NULLS LAST',
        },
      ],
      name: 'address_to_transfer_desc_id2',
    },
  ];

  // TODO: Need to display transfer_count
  static chainCustomAfter(schema: any): any {
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
      CREATE TRIGGER address_to_transfer_update_tables
      AFTER INSERT ON address_to_transfer
      REFERENCING NEW TABLE AS new_address_to_transfer
      FOR EACH STATEMENT EXECUTE PROCEDURE
      address_to_transfer_update_tables();
    `);
  }

  static get id1Type(): Class<BaseModel> {
    // eslint-disable-next-line
    return require('./Address').default;
  }

  static get id2Type(): Class<BaseModel> {
    // eslint-disable-next-line
    return require('./Transfer').default;
  }
}
