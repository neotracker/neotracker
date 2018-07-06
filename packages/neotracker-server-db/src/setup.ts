import { Monitor } from '@neo-one/monitor';
import Knex from 'knex';
import { createTable, dropTable, ModelSchema } from './lib';
import { models } from './models';

export const modelSchemas = models.reduce<{ readonly [key: string]: ModelSchema }>(
  (acc, model) => ({
    ...acc,
    [model.modelSchema.name]: model.modelSchema,
  }),
  {},
);

export const createTables = async (db: Knex, monitor: Monitor) => {
  // tslint:disable-next-line no-loop-statement
  for (const model of models) {
    await createTable(db, monitor, model.modelSchema, modelSchemas);
  }
};

export const dropTables = async (db: Knex, monitor: Monitor) => {
  // tslint:disable-next-line no-loop-statement
  for (const model of models) {
    await dropTable(db, monitor, model.modelSchema);
  }
};
