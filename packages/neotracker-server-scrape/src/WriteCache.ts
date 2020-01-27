import { isUniqueError } from '@neotracker/server-db';
import { utils } from '@neotracker/shared-utils';
import Knex from 'knex';
import LRUCache from 'lru-cache';
import { Transaction } from 'objection';

type Fetch<Key, Value> = (key: Key) => Promise<Value | undefined>;
type Create<Save, Value> = (save: Save) => Promise<Value>;
type GetKey<Key> = (key: Key) => string;
type GetKeyFrom<Key, Save> = (save: Save) => Key;
type Revert<RevertOptions> = (options: RevertOptions, db?: Knex | Transaction) => Promise<void>;
export interface WriteCacheOptions<Key, Value, Save, RevertOptions> {
  readonly db: Knex;
  readonly fetch: Fetch<Key, Value>;
  readonly create: Create<Save, Value>;
  readonly revert: Revert<RevertOptions>;
  readonly getKey: GetKey<Key>;
  readonly getKeyFromSave: GetKeyFrom<Key, Save>;
  readonly getKeyFromRevert: GetKeyFrom<Key, RevertOptions>;
  readonly size?: number;
}

export interface IWriteCache<Key, Value, Save, RevertOptions> {
  readonly get: (key: Key) => Promise<Value | undefined>;
  readonly getThrows: (key: Key) => Promise<Value>;
  readonly save: (save: Save) => Promise<Value>;
  readonly revert: (options: RevertOptions, db?: Knex | Transaction) => Promise<void>;
  readonly refresh: (key: Key) => void;
}

export class WriteCache<Key, Value, Save, RevertOptions> implements IWriteCache<Key, Value, Save, RevertOptions> {
  private readonly cache: LRUCache<string, Promise<Value | undefined>>;
  private readonly mutableSaveCache: { [K in string]?: Promise<Value> };
  private readonly db: Knex;
  private readonly fetch: Fetch<Key, Value>;
  private readonly create: Create<Save, Value>;
  private readonly revertInternal: Revert<RevertOptions>;
  private readonly getKey: GetKey<Key>;
  private readonly getKeyFromSave: GetKeyFrom<Key, Save>;
  private readonly getKeyFromRevert: GetKeyFrom<Key, RevertOptions>;

  public constructor({
    db,
    fetch,
    create,
    getKey,
    getKeyFromSave,
    getKeyFromRevert,
    revert,
    size,
  }: WriteCacheOptions<Key, Value, Save, RevertOptions>) {
    this.cache = new LRUCache(size === undefined ? 10000 : size);
    this.mutableSaveCache = {};
    this.db = db;
    this.fetch = fetch;
    this.create = create;
    this.revertInternal = revert;
    this.getKey = getKey;
    this.getKeyFromSave = getKeyFromSave;
    this.getKeyFromRevert = getKeyFromRevert;
  }

  public async get(keyIn: Key): Promise<Value | undefined> {
    const key = this.getKey(keyIn);

    let result: Promise<Value | undefined> | undefined = this.mutableSaveCache[key];
    if (result === undefined) {
      result = this.cache.get(key);
      if (result === undefined) {
        result = this.fetch(keyIn);
        this.cache.set(key, result);
      }
    }

    return result;
  }

  public async getThrows(key: Key): Promise<Value> {
    return this.get(key).then(utils.nullthrows);
  }

  public async save(save: Save): Promise<Value> {
    const keyIn = this.getKeyFromSave(save);
    const key = this.getKey(keyIn);

    return this.get(keyIn).then((result) => {
      if (result === undefined) {
        let saveResult = this.mutableSaveCache[key];
        if (saveResult === undefined) {
          saveResult = this.create(save)
            .then((returningResult) => {
              this.cache.set(key, Promise.resolve(returningResult));
              // tslint:disable-next-line no-dynamic-delete
              delete this.mutableSaveCache[key];

              return returningResult;
            })
            .catch(async (error: NodeJS.ErrnoException) => {
              // tslint:disable-next-line no-dynamic-delete
              delete this.mutableSaveCache[key];
              if (isUniqueError(this.db, error)) {
                return this.getThrows(keyIn);
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

  public async revert(options: RevertOptions, db?: Knex | Transaction): Promise<void> {
    this.cache.del(this.getKey(this.getKeyFromRevert(options)));
    await this.revertInternal(options, db);
  }

  public refresh(key: Key): void {
    const result = this.fetch(key);
    this.cache.set(this.getKey(key), result);
  }
}
