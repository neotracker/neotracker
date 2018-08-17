// tslint:disable
import { Monitor } from '@neo-one/monitor';
import Knex from 'knex';
import { Block as BlockModel } from '@neotracker/server-db';
import { Database, getDBData, getMonitor, startDB } from '@neotracker/server-test';
import { data, makeContext } from '../../data';
import { BlockUpdater } from '../../../db';
import { Context } from '../../../types';

const monitor = getMonitor();

const getInputs = () =>
  data.createBlock({
    nonce: 'wowowowowowowowo',
    index: 0,
  });

const getSecondBlock = () =>
  data.createBlock({
    nonce: 'ezezezezezezezez',
    index: 1,
  });

const getReversions = async (references: {
  readonly db: Knex;
  readonly context: Context;
  readonly monitor: Monitor;
}) => {
  const result = await BlockModel.query(references.db)
    .context(references.context.makeQueryContext(references.monitor))
    .where('id', 1)
    .first();

  return result;
};

describe(`Block Updater`, () => {
  let database: Database;
  let db: Knex;
  let context: Context;

  beforeAll(async () => {
    const databaseConfig = await startDB();
    database = databaseConfig.database;
  });

  beforeEach(async () => {
    await database.reset();
    db = database.knex;
    context = makeContext({ db });
    // @ts-ignore
    context.systemFee.save = jest.fn(() => Promise.resolve());
  });

  test(`Block Updater: handles insert/save`, async () => {
    const updater = new BlockUpdater();

    context = await updater.save(context, monitor, getInputs());
    const dbCheck = await getDBData(db);

    expect(dbCheck).toMatchSnapshot();
  });

  test(`Block Updater: handles duplicate inserts/saves`, async () => {
    const updater = new BlockUpdater();

    context = await updater.save(context, monitor, getInputs());
    const dbStart = await getDBData(db);

    context = await updater.save(context, monitor, getInputs());
    const dbFinal = await getDBData(db);

    expect(dbStart).toMatchSnapshot();
    expect(dbStart).toEqual(dbFinal);
  });

  test(`Block Updater: handles reverting inputs/saves`, async () => {
    // @ts-ignore
    context.systemFee.revert = jest.fn(() => Promise.resolve());
    context.client.getBlock = jest.fn(() => Promise.resolve());
    const updater = new BlockUpdater();

    context = await updater.save(context, monitor, getInputs());
    const dbNext = await getDBData(db);

    data.nextBlock();
    context = await updater.save(context, monitor, getSecondBlock());
    const dbInter = await getDBData(db);

    const revert = await getReversions({ db, context, monitor });
    if (revert !== undefined) {
      context = await updater.revert(context, monitor, revert);
    }
    const dbFinal = await getDBData(db);

    expect(dbNext).toMatchSnapshot();
    expect(dbInter).toMatchSnapshot();
    expect(dbInter).not.toEqual(dbNext);
    expect(dbFinal).toMatchSnapshot();
    expect(dbFinal).toEqual(dbNext);
  });
});
