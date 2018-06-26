// tslint:disable variable-name
import Knex from 'knex';
import { pubsub } from 'neotracker-server-utils';
import { Observable } from 'rxjs';
import { PROCESSED_NEXT_INDEX } from '../channels';
import { FieldSchema, IndexSchema } from '../lib';
import { GraphQLContext } from '../types';
import { BaseVisibleModel } from './BaseVisibleModel';
import { INTEGER_INDEX_VALIDATOR } from './common';

export class ProcessedIndex extends BaseVisibleModel<number> {
  public static readonly modelName = 'ProcessedIndex';
  public static readonly exposeGraphQL: boolean = false;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    {
      type: 'simple',
      columnNames: ['index'],
      name: 'processed_index_index',
      unique: true,
    },
  ];

  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: { type: 'id', big: false },
      required: false,
      exposeGraphQL: true,
      auto: true,
    },

    index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
  };

  public static chainCustomAfter(schema: Knex.SchemaBuilder): Knex.SchemaBuilder {
    return schema.raw(`
      CREATE OR REPLACE FUNCTION processed_index_notify() RETURNS trigger AS $processed_index_notify$
        BEGIN
          NOTIFY ${PROCESSED_NEXT_INDEX};
          RETURN NULL;
        END;
      $processed_index_notify$ LANGUAGE plpgsql;
    `).raw(`
      DROP TRIGGER IF EXISTS processed_index_notify
      ON processed_index;

      CREATE TRIGGER processed_index_notify AFTER INSERT
      ON processed_index FOR EACH ROW EXECUTE PROCEDURE
      processed_index_notify()
    `);
  }

  // tslint:disable no-any
  public static observable$(_obj: any, _args: any, _context: GraphQLContext, _info: any): Observable<any> {
    return pubsub.observable$(PROCESSED_NEXT_INDEX);
  }
  // tslint:enable no-any

  public readonly index!: number;
}
