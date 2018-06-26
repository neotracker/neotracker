// tslint:disable no-any
import { Monitor } from '@neo-one/monitor';
import { RootLoader } from '../loader';
import { Base } from './Base';

export interface QueryContext {
  readonly type: 'normal';
  readonly rootLoader: RootLoader;
  readonly monitor: Monitor;
  readonly isAllPowerful: boolean;
}

async function verifyCanView(model: any, context: QueryContext): Promise<any> {
  if (model instanceof Base) {
    const canView = await model.canView(context as any);

    return canView ? model : undefined;
  }

  return model;
}

export function makeQueryContext({
  rootLoader,
  monitor,
  isAllPowerful,
}: {
  readonly rootLoader: (() => RootLoader);
  readonly monitor: Monitor;
  readonly isAllPowerful?: boolean;
}): QueryContext {
  const queryContext = {
    type: 'normal',
    get rootLoader() {
      return rootLoader();
    },
    monitor,
    isAllPowerful: !!isAllPowerful,
    // tslint:disable-next-line no-unused
    runBefore: (__: any, queryBuilder: any) => {
      queryBuilder.options({ queryContext: queryBuilder.context() });
    },
    runAfter: undefined,
  };

  // @ts-ignore
  queryContext.runAfter = async (models: any) => {
    // tslint:disable no-object-mutation
    if (isAllPowerful) {
      return models;
    }

    if (models == undefined) {
      return models;
    }

    if (Array.isArray(models)) {
      const newModels = await Promise.all(models.map(async (model) => verifyCanView(model, queryContext as any)));

      return newModels.filter((model) => model != undefined);
    }

    return verifyCanView(models, queryContext as any);
  };

  return queryContext as any;
}
export interface AllPowerfulQueryContext {
  readonly type: 'allPowerful';
  readonly monitor: Monitor;
  readonly isAllPowerful: boolean;
}

export function makeAllPowerfulQueryContext(monitor: Monitor): AllPowerfulQueryContext {
  return {
    type: 'allPowerful',
    isAllPowerful: true,
    monitor,
    // @ts-ignore
    runBefore: (__, queryBuilder) => {
      queryBuilder.options({ queryContext: queryBuilder.context() });
    },
  };
}
