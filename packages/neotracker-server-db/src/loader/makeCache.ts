import LRUCache from 'lru-cache';
import { BaseModel } from '../lib';

type Key = string | number;

export interface Cache<TModel extends typeof BaseModel, TValue extends TModel | ReadonlyArray<TModel>> {
  readonly get: (key: Key) => Promise<TValue> | undefined;
  readonly set: (k: Key, v: Promise<TValue>) => void;
  readonly delete: (key: Key) => void;
  readonly clear: () => void;
}

export function makeCache<TModel extends typeof BaseModel, TValue extends TModel | TModel[]>({
  modelClass,
  cacheSize,
}: {
  readonly modelClass: TModel;
  readonly cacheSize: number;
}): Cache<TModel, TValue> {
  const cache = new LRUCache<Key, Promise<TValue>>({ max: cacheSize });

  return {
    get(key): Promise<TValue> | undefined {
      const value = cache.get(key);
      if (value === undefined) {
        return undefined;
      }

      // tslint:disable-next-line no-any
      return value.then((val: any) => {
        if (Array.isArray(val)) {
          return val.map((v) => modelClass.fromJson(v));
        }

        return val === undefined ? val : modelClass.fromJson(val);
      });
    },
    set(k, v): void {
      cache.set(
        k,
        // tslint:disable-next-line no-any
        v.then((res: any) => {
          if (Array.isArray(res)) {
            return res.map((r) => r.toJSON());
          }

          return res === undefined ? res : res.toJSON();
        }),
      );
    },
    delete(key): void {
      cache.del(key);
    },
    clear(): void {
      cache.reset();
    },
  };
}
