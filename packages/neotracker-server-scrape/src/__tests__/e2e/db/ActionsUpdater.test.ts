import { RawAction } from '@neo-one/client-full';
import { Database, getDBData, startDB } from '@neotracker/server-test';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import { ActionsUpdater } from '../../../db/ActionsUpdater';
import { normalizeAction } from '../../../normalizeBlock';
import { data, makeContext } from '../../data';

const createAction = (actionIn: RawAction, transactionID: string) => {
  const action = normalizeAction(actionIn);

  return {
    action,
    transactionID,
    transactionHash: action.transactionHash,
  };
};

describe('ActionsUpdater', () => {
  let database: Database;
  let db: Knex;

  beforeAll(async () => {
    const databaseConfig = await startDB();
    database = databaseConfig.database;
    db = database.knex;
  });

  beforeEach(async () => {
    await database.reset();
  });

  test('inserts actions', async () => {
    const context = makeContext({ db });
    const updater = new ActionsUpdater();

    await updater.save(context, {
      actions: [
        createAction(data.createRawLog({ index: 0, globalIndex: new BigNumber(0) }), '0'),
        createAction(data.createRawNotification({ index: 1, globalIndex: new BigNumber(1) }), '0'),
      ],
    });

    const dbData = await getDBData(db);
    expect(dbData).toMatchSnapshot();
  });

  test('handles duplicate inserts', async () => {
    const context = makeContext({ db });
    const updater = new ActionsUpdater();
    const actions = [
      createAction(data.createRawLog({ index: 0, globalIndex: new BigNumber(0) }), '0'),
      createAction(data.createRawNotification({ index: 1, globalIndex: new BigNumber(1) }), '0'),
    ];

    await updater.save(context, { actions });

    const dbData = await getDBData(db);

    await updater.save(context, { actions });

    const finalDBData = await getDBData(db);
    expect(dbData).toEqual(finalDBData);
  });

  test('reverts actions', async () => {
    const context = makeContext({ db });
    const updater = new ActionsUpdater();

    await updater.save(context, {
      actions: [
        createAction(data.createRawLog({ index: 0, globalIndex: new BigNumber(0) }), '0'),
        createAction(data.createRawNotification({ index: 1, globalIndex: new BigNumber(1) }), '0'),
      ],
    });

    data.nextBlock();
    const dbData = await getDBData(db);

    await updater.save(context, {
      actions: [
        createAction(data.createRawLog({ index: 0, globalIndex: new BigNumber(2) }), '1'),
        createAction(data.createRawNotification({ index: 1, globalIndex: new BigNumber(3) }), '1'),
      ],
    });

    const nextDBData = await getDBData(db);
    expect(nextDBData).toMatchSnapshot();

    await updater.revert(context, { transactionIDs: ['1'] });

    const finalDBData = await getDBData(db);
    expect(dbData).toEqual(finalDBData);
  });
});
