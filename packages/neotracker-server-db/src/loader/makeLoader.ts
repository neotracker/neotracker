import { createChild, serverLogger } from '@neotracker/logger';
import { labels } from '@neotracker/shared-utils';
import DataLoader from 'dataloader';
import Knex from 'knex';
import { Model, QueryBuilder } from 'objection';
import { AllPowerfulQueryContext, QueryContext } from '../lib';

const serverDBLogger = createChild(serverLogger, { component: 'database' });

export function makeLoader<TModel extends typeof Model>({
  db,
  modelClass,
  makeQueryContext,
  fieldName = 'id',
  plural = false,
  filter = (builder) => builder,
  options,
}: {
  readonly db: Knex;
  readonly modelClass: TModel;
  readonly makeQueryContext: () => QueryContext | AllPowerfulQueryContext;

  readonly fieldName?: string;
  readonly plural?: boolean;
  // tslint:disable-next-line no-any
  readonly filter?: (builder: QueryBuilder<any, any, any>) => QueryBuilder<any, any, any>;
  // tslint:disable-next-line no-any
  readonly options?: DataLoader.Options<any, any>;
}): DataLoader<{ readonly id: number }, ReadonlyArray<TModel>> {
  return new DataLoader<{ readonly id: number }, ReadonlyArray<TModel>>(
    async (values) => {
      if (values.length === 0) {
        return [];
      }
      serverDBLogger.info({ [labels.DB_TABLE]: modelClass.tableName, title: 'knex_loader_load_batch' });
      const ids = values.map(({ id }) => id);
      const models = await filter(
        modelClass
          .query(db)
          .context(makeQueryContext())
          .whereIn(fieldName, ids),
      );

      // tslint:disable-next-line no-any readonly-keyword
      const mutableIdToModel: any = {};
      // tslint:disable-next-line no-any
      models.forEach((model: any) => {
        if (plural) {
          if (mutableIdToModel[model[fieldName]] == undefined) {
            mutableIdToModel[model[fieldName]] = [];
          }
          mutableIdToModel[model[fieldName]].push(model);
        } else {
          mutableIdToModel[model[fieldName]] = model;
        }
      });

      return ids.map((id) => {
        if (plural) {
          return mutableIdToModel[id] === undefined ? [] : mutableIdToModel[id];
        }

        return mutableIdToModel[id];
      });
    },
    {
      ...options,
      cacheKeyFn: ({ id }) => id,
    },
  );
}
