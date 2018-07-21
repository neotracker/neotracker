export interface MapLike<T> {
  readonly get: (key: string) => T | undefined;
  readonly has: (key: string) => boolean;
  readonly set: (key: string, file: T) => void;
  readonly delete: (key: string) => void;
  // tslint:disable-next-line no-any
  readonly forEach: (callbackfn: (value: T, key: string, map: Map<string, T>) => void, thisArg?: any) => void;
  readonly values: () => IterableIterator<T>;
}

class MapBase<T> implements MapLike<T> {
  private readonly store = new Map<string, T>();

  public get(key: string) {
    return this.store.get(this.transformKey(key));
  }

  public delete(key: string) {
    return this.store.delete(this.transformKey(key));
  }

  public has(key: string) {
    return this.store.has(this.transformKey(key));
  }

  public set(key: string, file: T) {
    return this.store.set(this.transformKey(key), file);
  }

  public values(): IterableIterator<T> {
    return this.store.values();
  }

  // tslint:disable-next-line no-any
  public forEach(cb: (v: T, key: string, map: Map<string, T>) => void, thisArg?: any) {
    this.store.forEach(cb, thisArg);
  }

  protected transformKey(key: string): string {
    return key;
  }
}

export class CaseSensitiveMap<T> extends MapBase<T> {}

export class CaseInsensitiveMap<T> extends MapBase<T> {
  protected transformKey(key: string): string {
    return key.toLowerCase();
  }
}
