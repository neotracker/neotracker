import { Monitor } from '@neo-one/monitor';
import LRU from 'lru-cache';
import { utils } from 'neotracker-shared-utils';
import { CONFLICT_ERROR_CODE } from './constants';

type Fetch<Key, Value> = ((key: Key, monitor: Monitor) => Promise<Value | undefined>);
type Create<Save, Value> = ((save: Save, monitor: Monitor) => Promise<Value>);
type GetKey<Key> = ((key: Key) => string);
type GetKeyFromSave<Key, Save> = ((save: Save) => Key);
export interface WriteCacheOptions<Key, Value, Save> {
  readonly fetch: Fetch<Key, Value>;
  readonly create: Create<Save, Value>;
  readonly getKey: GetKey<Key>;
  readonly getKeyFromSave: GetKeyFromSave<Key, Save>;
  readonly size?: number;
}

export class WriteCache<Key, Value, Save> {
  private readonly cache: LRU.Cache<string, Promise<Value | undefined>>;
  private readonly mutableSaveCache: { [K in string]?: Promise<Value> };
  private readonly fetch: Fetch<Key, Value>;
  private readonly create: Create<Save, Value>;
  private readonly getKey: GetKey<Key>;
  private readonly getKeyFromSave: GetKeyFromSave<Key, Save>;

  public constructor({ fetch, create, getKey, getKeyFromSave, size }: WriteCacheOptions<Key, Value, Save>) {
    this.cache = LRU(size === undefined ? 10000 : size);
    this.mutableSaveCache = {};

    this.fetch = fetch;
    this.create = create;
    this.getKey = getKey;
    this.getKeyFromSave = getKeyFromSave;
  }

  public async get(keyIn: Key, monitor: Monitor): Promise<Value | undefined> {
    const key = this.getKey(keyIn);

    let result: Promise<Value | undefined> | undefined = this.mutableSaveCache[key];
    if (result === undefined) {
      result = this.cache.get(key);
      if (result === undefined) {
        result = this.fetch(keyIn, monitor);
        this.cache.set(key, result);
      }
    }

    return result;
  }

  public async getThrows(key: Key, monitor: Monitor): Promise<Value> {
    return this.get(key, monitor).then(utils.nullthrows);
  }

  public async save(save: Save, monitor: Monitor): Promise<Value> {
    const keyIn = this.getKeyFromSave(save);
    const key = this.getKey(keyIn);

    return this.get(keyIn, monitor).then((result) => {
      if (result === undefined) {
        let saveResult = this.mutableSaveCache[key];
        if (saveResult === undefined) {
          saveResult = this.create(save, monitor)
            .then((returningResult) => {
              this.cache.set(key, Promise.resolve(returningResult));
              // tslint:disable-next-line no-dynamic-delete
              delete this.mutableSaveCache[key];

              return returningResult;
            })
            .catch(async (error: NodeJS.ErrnoException) => {
              // tslint:disable-next-line no-dynamic-delete
              delete this.mutableSaveCache[key];
              if (error.code === CONFLICT_ERROR_CODE) {
                return this.getThrows(keyIn, monitor);
              }

              throw error;
            });
          this.mutableSaveCache[key] = saveResult;
        }

        return saveResult;
      }

      return result;
    });
  }

  public refresh(key: Key, monitor: Monitor): void {
    const result = this.fetch(key, monitor);
    this.cache.set(this.getKey(key), result);
  }
}
