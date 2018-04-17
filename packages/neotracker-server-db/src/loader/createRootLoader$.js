/* @flow */
import type DataLoader from 'dataloader';
import type knex from 'knex';
import { Model } from 'objection';
import type { Monitor } from '@neo-one/monitor';
import type { Observable } from 'rxjs/Observable';

import { combineLatest } from 'rxjs/observable/combineLatest';
import { entries } from 'neotracker-shared-utils';
import { lcFirst } from 'change-case';
import { map, startWith } from 'rxjs/operators';
import { pubsub } from 'neotracker-server-utils';

import { PROCESSED_NEXT_INDEX } from '../channels';
import { Block, ProcessedIndex, loaderModels as models } from '../models';
import {
  type BaseModel,
  type QueryContext,
  makeQueryContext as makeQueryContextBase,
} from '../lib';
import RootLoader, {
  type Loaders,
  type LoadersByField,
  type LoadersByEdge,
} from './RootLoader';

import makeCache from './makeCache';
import makeLoader from './makeLoader';

export type Options = {|
  cacheSize: number,
  cacheEnabled: boolean,
|};

const getLoaderOptions = (
  options: Options,
  model: Class<BaseModel<number>> | Class<BaseModel<string>>,
) =>
  options.cacheEnabled && model.cacheType === 'blockchain'
    ? {
        cacheMap: makeCache({
          modelClass: model,
          cacheSize: options.cacheSize,
        }),
      }
    : { cache: false };

const makeMaxIndexFetcher = (
  db: knex<*>,
  monitor: Monitor,
  makeQueryContext: (monitor: Monitor) => QueryContext,
) => {
  let maxIndex;
  return {
    async get(): Promise<string> {
      if (maxIndex == null) {
        maxIndex = await ProcessedIndex.query(db)
          .context(makeQueryContext(monitor))
          .max('index')
          .first()
          .then(res => res.max);
      }

      return maxIndex;
    },
  };
};

const createLoaders = ({
  db,
  options,
  monitor,
  makeQueryContext,
}: {|
  db: knex<*>,
  options: Options,
  monitor: Monitor,
  makeQueryContext: (monitor: Monitor) => QueryContext,
|}): {|
  loaders: Loaders,
  loadersByField: LoadersByField,
  loadersByEdge: LoadersByEdge,
  blockIndexLoader: DataLoader<{| id: string, monitor: Monitor |}, ?Block>,
  maxIndexFetcher: { get: () => Promise<string> },
|} => {
  const loaders = {};
  const loadersByField = {};
  const loadersByEdge = {};
  const addLoaderByField = (
    model: Class<BaseModel<number>> | Class<BaseModel<string>>,
    fieldName: string,
    loader: DataLoader<*, *>,
  ) => {
    const key = lcFirst(model.modelSchema.name);
    if (loadersByField[key] == null) {
      loadersByField[key] = {};
    }

    if (loadersByField[key][fieldName] == null) {
      loadersByField[key][fieldName] = (loader: $FlowFixMe);
    }

    return loadersByField[key][fieldName];
  };

  const addLoaderByEdge = (
    model: Class<BaseModel<number>> | Class<BaseModel<string>>,
    edgeName: string,
    loader: DataLoader<*, *>,
  ) => {
    const key = lcFirst(model.modelSchema.name);
    if (loadersByEdge[key] == null) {
      loadersByEdge[key] = {};
    }

    loadersByEdge[key][edgeName] = loader;
  };

  const addLoader = (
    model: Class<BaseModel<number>> | Class<BaseModel<string>>,
  ) => {
    const fieldName = 'id';
    let loader = makeLoader({
      db,
      modelClass: model,
      fieldName,
      makeQueryContext,
      options: getLoaderOptions(options, model),
    });
    loader = addLoaderByField(model, fieldName, loader);
    loaders[lcFirst(model.modelSchema.name)] = loader;
  };

  models.forEach(model => {
    addLoader(model);
    entries(model.modelSchema.edges || {}).forEach(([edgeName, edgeType]) => {
      if (
        edgeType.relation.relation === Model.HasOneRelation ||
        edgeType.relation.relation === Model.BelongsToOneRelation ||
        edgeType.relation.relation === Model.HasManyRelation
      ) {
        // eslint-disable-next-line
        const modelClass = edgeType.relation.modelClass;
        // eslint-disable-next-line
        const [__0, fieldName] = edgeType.relation.join.to.split('.');
        let loader = makeLoader({
          db,
          modelClass,
          fieldName,
          plural: edgeType.relation.relation === Model.HasManyRelation,
          filter: edgeType.relation.filter,
          makeQueryContext,
          options: getLoaderOptions(options, modelClass),
        });
        if (edgeType.relation.filter == null) {
          loader = addLoaderByField(modelClass, fieldName, loader);
        }

        addLoaderByEdge(model, edgeName, (loader: $FlowFixMe));
      }
    });
  });

  const blockIndexLoader = (addLoaderByField(
    Block,
    'index',
    makeLoader({
      db,
      modelClass: Block,
      fieldName: 'index',
      makeQueryContext,
      options: getLoaderOptions(options, Block),
    }),
  ): $FlowFixMe);
  const maxIndexFetcher = makeMaxIndexFetcher(db, monitor, makeQueryContext);

  return {
    loaders,
    loadersByField,
    loadersByEdge,
    blockIndexLoader,
    maxIndexFetcher,
  };
};

export const createRootLoader = (
  db: knex<*>,
  options: Options,
  rootMonitor: Monitor,
) => {
  let rootLoader;
  const getRootLoader = () => rootLoader;
  const makeQueryContext = (monitor: Monitor) =>
    makeQueryContextBase({
      rootLoader: getRootLoader,
      isAllPowerful: false,
      monitor,
    });
  const {
    loaders,
    loadersByField,
    loadersByEdge,
    blockIndexLoader,
    maxIndexFetcher,
  } = createLoaders({ db, options, monitor: rootMonitor, makeQueryContext });
  rootLoader = new RootLoader({
    db,
    makeQueryContext,
    makeAllPowerfulQueryContext: (monitor: Monitor) =>
      makeQueryContextBase({
        rootLoader: getRootLoader,
        isAllPowerful: true,
        monitor,
      }),
    loaders,
    loadersByField,
    loadersByEdge,
    blockIndexLoader,
    maxIndexFetcher,
  });
  return rootLoader;
};

export default ({
  db$,
  options$,
  monitor,
}: {|
  db$: Observable<knex<*>>,
  options$: Observable<Options>,
  monitor: Monitor,
|}): Observable<RootLoader> =>
  combineLatest(
    db$,
    options$,
    pubsub.observable(PROCESSED_NEXT_INDEX).pipe(startWith(0)),
  ).pipe(map(([db, options]) => createRootLoader(db, options, monitor)));
