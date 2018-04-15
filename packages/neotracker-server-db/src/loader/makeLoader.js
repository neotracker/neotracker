/* @flow */
import type Knex from 'knex';
import type { Model } from 'objection';
import type { Monitor } from '@neo-one/monitor';
import DataLoader from 'dataloader';

import { labels } from 'neotracker-shared-utils';

import type { AllPowerfulQueryContext, QueryContext } from '../lib';
import { type DataLoaderOptions } from './DataLoaderOptions';

export default function makeLoader<TModel: Model>({
  db,
  modelClass,
  makeQueryContext,
  fieldName: fieldNameIn,
  plural: pluralIn,
  filter: filterIn,
  options,
}: {|
  db: Knex<*>,
  modelClass: Class<TModel>,
  makeQueryContext: (
    monitor: Monitor,
  ) => QueryContext | AllPowerfulQueryContext,
  fieldName?: string,
  plural?: boolean,
  filter?: (builder: any) => any,
  options?: DataLoaderOptions,
|}): DataLoader<{| id: number, monitor: Monitor |}, Array<TModel>> {
  const fieldName = fieldNameIn == null ? 'id' : fieldNameIn;
  const plural = pluralIn == null ? false : pluralIn;
  const filter = filterIn || (builder => builder);
  return new DataLoader(
    async values => {
      if (values.length === 0) {
        return [];
      }
      const { monitor } = values[0];
      return monitor
        .withLabels({
          [labels.DB_TABLE]: modelClass.tableName,
        })
        .captureSpanLog(
          async span => {
            const ids = values.map(({ id }) => id);
            const models = await filter(
              modelClass
                .query(db)
                .context(makeQueryContext(span))
                .whereIn(fieldName, ids),
            );
            const idToModel = {};
            models.forEach(model => {
              if (plural) {
                if (idToModel[model[fieldName]] == null) {
                  idToModel[model[fieldName]] = [];
                }
                idToModel[model[fieldName]].push(model);
              } else {
                idToModel[model[fieldName]] = model;
              }
            });
            return ids.map(
              id => (plural ? idToModel[id] || [] : idToModel[id]),
            );
          },
          {
            name: 'knex_loader_load_batch',
            level: { log: 'debug', span: 'info' },
            error: {},
            references: values
              .slice(1)
              .map(({ monitor: parent }) => monitor.childOf(parent)),
          },
        );
    },
    {
      ...options,
      cacheKeyFn: ({ id }) => id,
    },
  );
}
