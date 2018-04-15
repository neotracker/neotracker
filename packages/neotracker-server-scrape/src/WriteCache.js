/* @flow */
import LRU from 'lru-cache';
import type { Monitor } from '@neo-one/monitor';

import { CONFLICT_ERROR_CODE } from './constants';

type Fetch<Key, Value> = (key: Key, monitor: Monitor) => Promise<Value>;
type Create<Save, Value> = (save: Save, monitor: Monitor) => Promise<Value>;
type GetKey<Key> = (key: Key) => string;
type GetKeyFromSave<Key, Save> = (save: Save) => Key;
export type WriteCacheOptions<Key, Value, Save> = {|
  fetch: Fetch<Key, Value>,
  create: Create<Save, Value>,
  getKey: GetKey<Key>,
  getKeyFromSave: GetKeyFromSave<Key, Save>,
  size?: number,
|};

export default class WriteCache<Key, Value, Save> {
  _cache: LRU;
  _saveCache: { [key: string]: Promise<Value> };

  _fetch: Fetch<Key, Value>;
  _create: Create<Save, Value>;
  _getKey: GetKey<Key>;
  _getKeyFromSave: GetKeyFromSave<Key, Save>;

  constructor({
    fetch,
    create,
    getKey,
    getKeyFromSave,
    size,
  }: WriteCacheOptions<Key, Value, Save>) {
    this._cache = LRU(size == null ? 10000 : size);
    this._saveCache = {};

    this._fetch = fetch;
    this._create = create;
    this._getKey = getKey;
    this._getKeyFromSave = getKeyFromSave;
  }

  get(keyIn: Key, monitor: Monitor): Promise<Value> {
    const key = this._getKey(keyIn);

    let result = this._saveCache[key];
    if (result == null) {
      result = this._cache.get(key);
      if (result == null) {
        result = this._fetch(keyIn, monitor);
        this._cache.set(key, result);
      }
    }

    return result;
  }

  save(save: Save, monitor: Monitor): Promise<Value> {
    const keyIn = this._getKeyFromSave(save);
    const key = this._getKey(keyIn);

    return this.get(keyIn, monitor).then(result => {
      if (result == null) {
        let saveResult = this._saveCache[key];
        if (saveResult == null) {
          saveResult = this._create(save, monitor)
            .then(returningResult => {
              this._cache.set(key, Promise.resolve(returningResult));
              delete this._saveCache[key];
              return returningResult;
            })
            .catch(error => {
              delete this._saveCache[key];
              if (error.code === CONFLICT_ERROR_CODE) {
                return this.get(keyIn, monitor);
              }

              throw error;
            });
          this._saveCache[key] = saveResult;
        }

        return saveResult;
      }

      return result;
    });
  }
}
