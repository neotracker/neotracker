import Knex from 'knex';
import { createTable, dropTable, ModelSchema } from './lib';
import { models } from './models';

export const modelSchemas = () =>
  models().reduce<{ readonly [key: string]: ModelSchema }>(
    (acc, model) => ({
      ...acc,
      [model.modelSchema.name]: model.modelSchema,
    }),
    {},
  );

export const createTables = async (db: Knex) => {
  await Promise.all(models().map(async (model) => createTable(db, model.modelSchema, modelSchemas())));
};

export const dropTables = async (db: Knex, checkEmpty = false) => {
  await Promise.all(models().map(async (model) => dropTable(db, model.modelSchema, checkEmpty)));
};
