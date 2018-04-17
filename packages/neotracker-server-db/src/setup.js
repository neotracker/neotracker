/* @flow */
import type { Monitor } from '@neo-one/monitor';

import type knex from 'knex';

import { createTable, setupForCreate } from './lib';
import models from './models';

const modelSchemas = {};
models.forEach(model => {
  modelSchemas[model.modelSchema.name] = model.modelSchema;
});

export { modelSchemas };

export const createTables = async (db: knex<*>, monitor: Monitor) => {
  await setupForCreate(db, monitor);
  for (const model of models) {
    // eslint-disable-next-line
    await createTable(db, monitor, model.modelSchema, modelSchemas);
  }
};
