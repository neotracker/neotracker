import { Monitor } from '@neo-one/monitor';
import Knex from 'knex';
import { createTable, ModelSchema, setupForCreate } from './lib';
import { models } from './models';

export const modelSchemas = models.reduce<{ readonly [key: string]: ModelSchema }>(
  (acc, model) => ({
    ...acc,
    [model.modelSchema.name]: model.modelSchema,
  }),
  {},
);

export const createTables = async (db: Knex, monitor: Monitor) => {
  await setupForCreate(db, monitor);
  // tslint:disable-next-line no-loop-statement
  for (const model of models) {
    await createTable(db, monitor, model.modelSchema, modelSchemas);
  }
};
