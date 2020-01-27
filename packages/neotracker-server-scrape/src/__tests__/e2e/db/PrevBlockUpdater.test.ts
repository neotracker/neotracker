import { Block as BlockModel } from '@neotracker/server-db';
import Knex from 'knex';
import { PrevBlockRevert, PrevBlockUpdate, PrevBlockUpdater } from '../../../db/PrevBlockUpdater';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const blockInit = data.createBlockModel({ id: 1 });
const blockSecondary = data.createBlockModel({ id: 2 });

const initiateTest = async (db: Knex) => {
  const context = makeContext({ db });

  await Promise.all([
    BlockModel.query(db)
      .context(context.makeQueryContext())
      .insert([blockInit]),
    BlockModel.query(db)
      .context(context.makeQueryContext())
      .insert([blockSecondary]),
  ]);

  return { references: undefined };
};

const getInputs = () => ({
  block: data.createBlock({ index: 2 }),
});

const getSecondaryInputs = () => ({
  block: data.createBlock({ index: 3 }),
});

const getReversions = () => ({
  blockIndex: 3,
});

const utilOptions: UpdaterUtilTestOptions<PrevBlockUpdate, PrevBlockRevert, undefined> = {
  name: `Prev Block Updater`,
  initiateTest,
  createUpdater: () => new PrevBlockUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);
