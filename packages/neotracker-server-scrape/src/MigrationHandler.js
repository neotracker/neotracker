/* @flow */
import {
  type QueryContext,
  Migration,
  createTable,
  makeAllPowerfulQueryContext,
  models,
  setupForCreate,
} from 'neotracker-server-db';
import type { Monitor } from '@neo-one/monitor';
import type knex from 'knex';

import migrations from './migrations';

export default class MigrationHandler {
  _enabled: boolean;
  _db: knex<*>;
  _makeQueryContext: (monitor: Monitor) => QueryContext;
  _monitor: Monitor;
  _tableCreated: boolean;

  constructor({
    enabled,
    db,
    makeQueryContext,
    monitor,
  }: {|
    enabled: boolean,
    db: knex<*>,
    makeQueryContext: (monitor: Monitor) => QueryContext,
    monitor: Monitor,
  |}) {
    this._enabled = enabled;
    this._db = db;
    this._makeQueryContext = makeQueryContext;
    this._monitor = monitor;
    this._tableCreated = false;
  }

  async shouldExecute(name: string): Promise<boolean> {
    if (!this._enabled) {
      return false;
    }

    if (!this._tableCreated) {
      const schema = ((this._db: $FlowFixMe).schema: $FlowFixMe);
      const { modelSchema } = Migration;
      const exists = await schema
        .hasTable(modelSchema.tableName)
        .queryContext(makeAllPowerfulQueryContext(this._monitor));
      if (!exists) {
        const modelSchemas = {};
        models.forEach(model => {
          modelSchemas[model.modelSchema.name] = model.modelSchema;
        });
        await setupForCreate(this._db, this._monitor);
        await createTable(
          this._db,
          this._monitor,
          Migration.modelSchema,
          modelSchemas,
        );
      }

      const initMigration = await this._getMigration('initialization');
      if (initMigration == null || !initMigration.complete) {
        await Promise.all(
          migrations.map(([migrationName]) => this.onComplete(migrationName)),
        );
        await this.onComplete('initialization');
      }

      this._tableCreated = true;
    }

    const migration = await this._getMigration(name);

    return migration == null ? true : !migration.complete;
  }

  async onComplete(name: string): Promise<void> {
    const migration = await this._getMigration(name);
    if (migration == null) {
      await Migration.query(this._db)
        .context(this._makeQueryContext(this._monitor))
        .insert({ name, complete: true });
    } else {
      await migration
        .$query(this._db)
        .context(this._makeQueryContext(this._monitor))
        .patch({ complete: true });
    }
  }

  async checkpoint(
    name: string,
    data: string,
    monitor: Monitor,
  ): Promise<void> {
    const migration = await this._getMigration(name, monitor);
    if (migration == null) {
      await Migration.query(this._db)
        .context(this._makeQueryContext(monitor))
        .insert({ name, complete: false, data });
    } else {
      await migration
        .$query(this._db)
        .context(this._makeQueryContext(monitor))
        .patch({ data });
    }
  }

  async getCheckpoint(name: string, monitor: Monitor): Promise<?string> {
    const migration = await this._getMigration(name, monitor);
    return migration == null ? null : migration.data;
  }

  _getMigration(name: string, monitor?: Monitor): Promise<?Migration> {
    return Migration.query(this._db)
      .context(this._makeQueryContext(monitor || this._monitor))
      .where('name', name)
      .first();
  }
}
