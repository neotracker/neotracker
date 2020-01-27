// tslint:disable prefer-switch
import { lcFirst } from 'change-case';
import DataLoader from 'dataloader';
import Knex from 'knex';
import { Model } from 'objection';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { BaseModel, makeQueryContext as makeQueryContextBase, QueryContext } from '../lib';
import { Block, loaderModels as models, ProcessedIndex, Transaction } from '../models';
import { makeCache } from './makeCache';
import { makeLoader } from './makeLoader';
import { Loaders, LoadersByEdge, LoadersByField, NumberLoader, RootLoader } from './RootLoader';

export interface Options {
  readonly cacheSize: number;
  readonly cacheEnabled: boolean;
}

const getLoaderOptions = (options: Options, model: typeof BaseModel) =>
  options.cacheEnabled && model.cacheType === 'blockchain'
    ? {
        cacheMap: makeCache({
          modelClass: model,
          cacheSize: options.cacheSize,
        }),
      }
    : { cache: false };

const makeMaxIndexFetcher = (db: Knex, makeQueryContext: () => QueryContext) => {
  let maxIndex: number | undefined;

  return {
    async get(): Promise<number> {
      if (maxIndex === undefined) {
        maxIndex = await ProcessedIndex.query(db)
          .context(makeQueryContext())
          .max('index')
          .first()
          .then((result) => {
            // Handle sqlite return
            // tslint:disable-next-line no-any
            if (result !== undefined && (result as any)['max(`index`)'] != undefined) {
              // tslint:disable-next-line no-any
              return (result as any)['max(`index`)'];
            }

            // tslint:disable-next-line no-any
            return result === undefined || (result as any).max == undefined ? 0 : (result as any).max;
          })
          .then(Number);
      }

      return maxIndex as number;
    },
    reset(): void {
      maxIndex = undefined;
    },
  };
};

// tslint:disable readonly-keyword
interface LoadersMutable {
  [id: string]: NumberLoader<BaseModel | undefined>;
}
interface LoadersByFieldMutable {
  [id: string]: LoadersMutable;
}
interface LoadersByEdgeNameMutable {
  [edgeName: string]: NumberLoader<ReadonlyArray<BaseModel>>;
}
interface LoadersByEdgeMutable {
  [name: string]: LoadersByEdgeNameMutable;
}
// tslint:enable readonly-keyword

const createLoaders = ({
  db,
  options,
  makeQueryContext,
}: {
  readonly db: Knex;
  readonly options: Options;
  readonly makeQueryContext: () => QueryContext;
}): {
  readonly loaders: Loaders;
  readonly loadersByField: LoadersByField;
  readonly loadersByEdge: LoadersByEdge;
  readonly blockHashLoader: DataLoader<{ readonly id: string }, Block | undefined>;
  readonly transactionHashLoader: DataLoader<{ readonly id: string }, Transaction | undefined>;

  readonly maxIndexFetcher: { readonly get: () => Promise<number>; readonly reset: () => void };
} => {
  const mutableLoaders: LoadersMutable = {};
  const mutableLoadersByField: LoadersByFieldMutable = {};
  const mutableLoadersByEdge: LoadersByEdgeMutable = {};
  // tslint:disable-next-line no-any
  const addLoaderByField = (model: typeof BaseModel, fieldName: string, loader: DataLoader<any, any>) => {
    const key = lcFirst(model.modelSchema.name);
    if ((mutableLoadersByField[key] as Loaders | undefined) === undefined) {
      mutableLoadersByField[key] = {};
    }

    if ((mutableLoadersByField[key][fieldName] as NumberLoader<BaseModel | undefined> | undefined) === undefined) {
      mutableLoadersByField[key][fieldName] = loader;
    }

    return mutableLoadersByField[key][fieldName];
  };

  const addLoaderByEdge = (
    model: typeof BaseModel,
    edgeName: string,
    // tslint:disable-next-line no-any
    loader: DataLoader<any, any>,
  ) => {
    const key = lcFirst(model.modelSchema.name);
    if ((mutableLoadersByEdge[key] as LoadersByEdgeNameMutable | undefined) === undefined) {
      mutableLoadersByEdge[key] = {};
    }

    mutableLoadersByEdge[key][edgeName] = loader;
  };

  const addLoader = (model: typeof BaseModel) => {
    const fieldName = 'id';
    const loader = makeLoader({
      db,
      modelClass: model,
      fieldName,
      makeQueryContext,
      options: getLoaderOptions(options, model),
    });

    mutableLoaders[lcFirst(model.modelSchema.name)] = addLoaderByField(model, fieldName, loader);
  };

  models().forEach((model) => {
    addLoader(model);
    Object.entries(model.modelSchema.edges === undefined ? {} : model.modelSchema.edges).forEach(
      ([edgeName, edgeType]) => {
        if (
          // tslint:disable-next-line: strict-comparisons
          edgeType.relation.relation === Model.HasOneRelation ||
          // tslint:disable-next-line: strict-comparisons
          edgeType.relation.relation === Model.BelongsToOneRelation ||
          // tslint:disable-next-line: strict-comparisons
          edgeType.relation.relation === Model.HasManyRelation
        ) {
          // tslint:disable-next-line no-any no-unnecessary-type-assertion
          const modelClass: typeof BaseModel = edgeType.relation.modelClass as any;
          // @ts-ignore
          const result = edgeType.relation.join.to.split('.');
          const fieldName = result[1];
          // tslint:disable-next-line no-any
          let loader: DataLoader<any, any> = makeLoader({
            db,
            modelClass,
            fieldName,
            // tslint:disable-next-line: strict-comparisons
            plural: edgeType.relation.relation === Model.HasManyRelation,
            filter:
              typeof edgeType.relation.filter === 'object' || typeof edgeType.relation.filter === 'string'
                ? undefined
                : edgeType.relation.filter,
            makeQueryContext,
            options: getLoaderOptions(options, modelClass),
          });

          if (edgeType.relation.filter === undefined) {
            loader = addLoaderByField(modelClass, fieldName, loader);
          }

          addLoaderByEdge(model, edgeName, loader);
        }
      },
    );
  });

  // tslint:disable-next-line no-any
  const blockHashLoader: DataLoader<any, any> = addLoaderByField(
    // tslint:disable-next-line no-any
    Block as any,
    'hash',
    makeLoader({
      db,
      modelClass: Block,
      fieldName: 'hash',
      makeQueryContext,
      // tslint:disable-next-line no-any
      options: getLoaderOptions(options, Block as any),
    }),
  );

  // tslint:disable-next-line no-any
  const transactionHashLoader: DataLoader<any, any> = addLoaderByField(
    // tslint:disable-next-line no-any
    Transaction as any,
    'hash',
    makeLoader({
      db,
      modelClass: Transaction,
      fieldName: 'hash',
      makeQueryContext,
      // tslint:disable-next-line no-any
      options: getLoaderOptions(options, Transaction as any),
    }),
  );

  const maxIndexFetcher = makeMaxIndexFetcher(db, makeQueryContext);

  return {
    loaders: mutableLoaders,
    loadersByField: mutableLoadersByField,
    loadersByEdge: mutableLoadersByEdge,
    blockHashLoader,
    transactionHashLoader,
    maxIndexFetcher,
  };
};

export const createRootLoader = (db: Knex, options: Options) => {
  let rootLoader: RootLoader;
  const getRootLoader = () => rootLoader;
  const makeQueryContext = () =>
    makeQueryContextBase({
      rootLoader: getRootLoader,
      isAllPowerful: false,
    });

  const {
    loaders,
    loadersByField,
    loadersByEdge,
    blockHashLoader,
    transactionHashLoader,
    maxIndexFetcher,
  } = createLoaders({ db, options, makeQueryContext });
  rootLoader = new RootLoader({
    db,
    makeQueryContext,
    makeAllPowerfulQueryContext: () =>
      makeQueryContextBase({
        rootLoader: getRootLoader,
        isAllPowerful: true,
      }),
    loaders,
    loadersByField,
    loadersByEdge,
    blockHashLoader,
    transactionHashLoader,
    maxIndexFetcher,
  });

  return rootLoader;
};

export const createRootLoader$ = ({
  db$,
  options$,
}: {
  readonly db$: Observable<Knex>;
  readonly options$: Observable<Options>;
}): Observable<RootLoader> =>
  combineLatest([db$, options$])
    .pipe(map(([db, options]) => createRootLoader(db, options)))
    .pipe(distinctUntilChanged());
