/* @flow */
import LRUCache from 'lru-cache';
import type { Model } from 'objection';

type Key = string | number;
export type Cache<TModel: Model, TValue: TModel | Array<TModel>> = {|
  get(key: Key): ?Promise<TValue>,
  set(k: Key, v: Promise<TValue>): void,
  delete(key: Key): void,
  clear(): void,
|};

export default function<TModel: Model, TValue: TModel | Array<TModel>>({
  modelClass,
  cacheSize,
}: {|
  modelClass: Class<TModel>,
  cacheSize: number,
|}): Cache<TModel, TValue> {
  const cache = new LRUCache({ max: cacheSize });
  return {
    get(key: Key): ?Promise<TValue> {
      const value = cache.get(key);
      if (value == null) {
        return null;
      }

      return value.then(val => {
        if (Array.isArray(val)) {
          return val.map(v => modelClass.fromJson(v));
        }

        return val == null ? val : modelClass.fromJson(val);
      });
    },
    set(k: Key, v: Promise<TValue>): void {
      cache.set(
        k,
        v.then(res => {
          if (Array.isArray(res)) {
            return res.map(r => r.toJSON());
          }

          return res == null ? res : res.toJSON();
        }),
      );
    },
    delete(key: Key): void {
      cache.del(key);
    },
    clear(): void {
      cache.reset();
    },
  };
}
