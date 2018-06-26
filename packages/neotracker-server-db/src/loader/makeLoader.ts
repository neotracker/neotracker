import { Monitor } from '@neo-one/monitor';
import DataLoader from 'dataloader';
import Knex from 'knex';
import { labels } from 'neotracker-shared-utils';
import { Model, QueryBuilder } from 'objection';
import { AllPowerfulQueryContext, QueryContext } from '../lib';

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
  readonly makeQueryContext: ((monitor: Monitor) => QueryContext | AllPowerfulQueryContext);

  readonly fieldName?: string;
  readonly plural?: boolean;
  // tslint:disable-next-line no-any
  readonly filter?: ((builder: QueryBuilder<any, any, any>) => QueryBuilder<any, any, any>);
  // tslint:disable-next-line no-any
  readonly options?: DataLoader.Options<any, any>;
}): DataLoader<{ readonly id: number; readonly monitor: Monitor }, ReadonlyArray<TModel>> {
  return new DataLoader<{ readonly id: number; readonly monitor: Monitor }, ReadonlyArray<TModel>>(
    async (values) => {
      if (values.length === 0) {
        return [];
      }
      const { monitor } = values[0];

      return monitor
        .withLabels({
          [labels.DB_TABLE]: modelClass.tableName,
        })
        .captureSpanLog(
          async (span) => {
            const ids = values.map(({ id }) => id);
            const models = await filter(
              modelClass
                .query(db)
                .context(makeQueryContext(span))
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
            name: 'knex_loader_load_batch',
            level: { log: 'debug', span: 'info' },
            error: {},
            references: values.slice(1).map(({ monitor: parent }) => monitor.childOf(parent)),
          },
        );
    },
    {
      ...options,
      cacheKeyFn: ({ id }) => id,
    },
  );
}
