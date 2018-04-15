/* @flow */

export type DataLoaderOptions = {|
  batch?: boolean,
  maxBatchSize?: number,
  cache?: boolean,
  cacheKeyFn?: (key: any) => string,
  cacheMap?: any,
|};
