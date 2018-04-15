/* @flow */
import stringify from 'safe-stable-stringify';

export default class RelaySSRQueryCache {
  cache: { [queryID: string]: { [variablesSerialized: string]: Object } };

  constructor() {
    this.cache = {};
  }

  add(queryID: string, variables: Object, response: Object): void {
    if (this.cache[queryID] == null) {
      this.cache[queryID] = {};
    }

    const variablesSerialized = stringify(variables);
    this.cache[queryID][variablesSerialized] = response;
  }

  get(queryID: string, variables: Object): ?Object {
    const firstCache = this.cache[queryID];
    return firstCache == null ? null : firstCache[stringify(variables)];
  }

  toData(): Object {
    return this.cache;
  }
}
