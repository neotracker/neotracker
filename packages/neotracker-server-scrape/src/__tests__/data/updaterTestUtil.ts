// tslint:disable no-console
import { Database, getDBData, startDB } from '@neotracker/server-test';
import Knex from 'knex';
import { DBUpdater } from '../../db/DBUpdater';
import { SameContextDBUpdater } from '../../db/SameContextDBUpdater';
import { Context } from '../../types';
import { nextBlock } from './data';
import { makeContext } from './makeContext';

export interface UpdaterUtilTestOptions<Save, Revert, References> {
  readonly name: string;
  readonly initiateTest?: (db: Knex, context?: Context) => Promise<{ readonly references: References }>;
  readonly secondaryInit?: (db: Knex, context?: Context) => Promise<void>;
  readonly createUpdater: () => SameContextDBUpdater<Save, Revert> | DBUpdater<Save, Revert>;
  readonly getInputs: (references: References) => Save;
  readonly getSecondaryInputs?: (references: References) => Save;
  readonly getReversions: (references: References) => Revert;
}

// tslint:disable-next-line no-any
export const updaterUnitTest = <Save, Revert, References>(args: UpdaterUtilTestOptions<Save, Revert, References>) => {
  describe(`${args.name}`, () => {
    let database: Database;
    let references: References;
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
      if (args.initiateTest !== undefined) {
        ({ references } = await args.initiateTest(db));
      }
    });

    test(`${args.name}: handles insert/save`, async () => {
      const updater = args.createUpdater();

      if (updater instanceof DBUpdater) {
        context = await updater.save(context, args.getInputs(references));
      } else {
        await updater.save(context, args.getInputs(references));
      }
      const dbCheck = await getDBData(db);

      expect(dbCheck).toMatchSnapshot();
    });

    test(`${args.name}: handles duplicate inserts/saves`, async () => {
      const updater = args.createUpdater();

      if (updater instanceof DBUpdater) {
        context = await updater.save(context, args.getInputs(references));
      } else {
        await updater.save(context, args.getInputs(references));
      }
      const dbStart = await getDBData(db);

      if (updater instanceof DBUpdater) {
        context = await updater.save(context, args.getInputs(references));
      } else {
        await updater.save(context, args.getInputs(references));
      }
      const dbFinal = await getDBData(db);

      expect(dbStart).toMatchSnapshot();
      expect(dbStart).toEqual(dbFinal);
    });

    test(`${args.name}: handles reverting inputs/saves`, async () => {
      const updater = args.createUpdater();

      if (updater instanceof DBUpdater) {
        context = await updater.save(context, args.getInputs(references));
      } else {
        await updater.save(context, args.getInputs(references));
      }

      const dbInit = await getDBData(db);

      nextBlock();

      if (args.secondaryInit) {
        await args.secondaryInit(db);
      }

      if (args.getSecondaryInputs !== undefined) {
        if (updater instanceof DBUpdater) {
          context = await updater.save(context, args.getSecondaryInputs(references));
        } else {
          await updater.save(context, args.getSecondaryInputs(references));
        }
      }

      const dbSecondary = await getDBData(db);

      if (updater instanceof DBUpdater) {
        context = await updater.revert(context, args.getReversions(references));
      } else {
        await updater.revert(context, args.getReversions(references));
      }
      const dbFinal = await getDBData(db);

      expect(dbInit).toMatchSnapshot();
      expect(dbSecondary).toMatchSnapshot();
      expect(dbSecondary).not.toEqual(dbInit);
      expect(dbFinal).toMatchSnapshot();
      expect(dbFinal).toEqual(dbInit);
    });
  });
};
