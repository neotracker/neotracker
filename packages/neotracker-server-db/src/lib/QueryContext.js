/* @flow */
import type { Monitor } from '@neo-one/monitor';

import Base from './Base';
import type { RootLoader } from '../loader';

export type QueryContext = {
  type: 'normal',
  rootLoader: RootLoader,
  monitor: Monitor,
  isAllPowerful: boolean,
};

async function verifyCanView(model: mixed, context: QueryContext): mixed {
  if (model instanceof Base) {
    const canView = await model.canView(context);
    return canView ? model : null;
  }
  return model;
}

export function makeQueryContext({
  rootLoader,
  monitor,
  isAllPowerful,
}: {|
  rootLoader: () => RootLoader,
  monitor: Monitor,
  isAllPowerful?: boolean,
|}): QueryContext {
  const queryContext = {
    type: 'normal',
    get rootLoader() {
      return rootLoader();
    },
    monitor,
    isAllPowerful: !!isAllPowerful,
    runBefore: (__, queryBuilder) => {
      queryBuilder.options({ queryContext: queryBuilder.context() });
    },
    runAfter: undefined,
  };
  queryContext.runAfter = async (models: mixed) => {
    if (isAllPowerful) {
      return models;
    }

    if (models == null) {
      return models;
    }

    if (Array.isArray(models)) {
      const newModels = await Promise.all(
        models.map(model => verifyCanView(model, queryContext)),
      );
      return newModels.filter(model => model != null);
    }

    return verifyCanView(models, queryContext);
  };
  return queryContext;
}

export type AllPowerfulQueryContext = {
  type: 'allPowerful',
  monitor: Monitor,
  isAllPowerful: boolean,
};
export function makeAllPowerfulQueryContext(
  monitor: Monitor,
): AllPowerfulQueryContext {
  return {
    type: 'allPowerful',
    isAllPowerful: true,
    monitor,
    runBefore: (__, queryBuilder) => {
      queryBuilder.options({ queryContext: queryBuilder.context() });
    },
  };
}
