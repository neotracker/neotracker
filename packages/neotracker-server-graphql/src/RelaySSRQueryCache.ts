// tslint:disable no-any no-object-mutation
import stringify from 'safe-stable-stringify';

export class RelaySSRQueryCache {
  // tslint:disable-next-line readonly-keyword
  private readonly mutableCache: { [QueryID in string]?: { [VariablesSerialized in string]?: any } };

  public constructor() {
    this.mutableCache = {};
  }

  public add(queryID: string, variables: any, response: any): void {
    let byQuery = this.mutableCache[queryID];
    if (byQuery === undefined) {
      this.mutableCache[queryID] = byQuery = {};
    }

    const variablesSerialized = stringify(variables);
    byQuery[variablesSerialized] = response;
  }

  public get(queryID: string, variables: any): any | undefined {
    const firstCache = this.mutableCache[queryID];

    return firstCache === undefined ? undefined : firstCache[stringify(variables)];
  }

  public toData(): any {
    return this.mutableCache;
  }
}
