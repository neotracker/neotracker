import { createTables, makeAllPowerfulQueryContext, Migration, QueryContext } from '@neotracker/server-db';
import Knex from 'knex';
import { migrations } from './migrations';

export class MigrationHandler {
  private readonly enabled: boolean;
  private readonly db: Knex;
  private readonly makeQueryContext: () => QueryContext;
  private mutableTableCreated: boolean;

  public constructor({
    enabled,
    db,
    makeQueryContext,
  }: {
    readonly enabled: boolean;
    readonly db: Knex;
    readonly makeQueryContext: () => QueryContext;
  }) {
    this.enabled = enabled;
    this.db = db;
    this.makeQueryContext = makeQueryContext;
    this.mutableTableCreated = false;
  }

  public async shouldExecute(name: string): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    if (!this.mutableTableCreated) {
      const schema = this.db.schema;
      const { modelSchema } = Migration;
      const exists = await schema.queryContext(makeAllPowerfulQueryContext()).hasTable(modelSchema.tableName);
      if (!exists) {
        await createTables(this.db);
      }

      const initMigration = await this.getMigration('initialization');
      if (initMigration === undefined || !initMigration.complete) {
        await Promise.all(migrations.map(async ([migrationName]) => this.onComplete(migrationName)));

        await this.onComplete('initialization');
      }

      this.mutableTableCreated = true;
    }

    const migration = await this.getMigration(name);

    return migration === undefined ? true : !migration.complete;
  }

  public async onComplete(name: string): Promise<void> {
    const migration = await this.getMigration(name);
    if (migration === undefined) {
      await Migration.query(this.db)
        .context(this.makeQueryContext())
        .insert({ name, complete: true });
    } else {
      await migration
        .$query(this.db)
        .context(this.makeQueryContext())
        .patch({ complete: true });
    }
  }

  public async checkpoint(name: string, data: string): Promise<void> {
    const migration = await this.getMigration(name);
    if (migration === undefined) {
      await Migration.query(this.db)
        .context(this.makeQueryContext())
        .insert({ name, complete: false, data });
    } else {
      await migration
        .$query(this.db)
        .context(this.makeQueryContext())
        .patch({ data });
    }
  }

  public async getCheckpoint(name: string): Promise<string | undefined> {
    const migration = await this.getMigration(name);

    return migration === undefined ? undefined : migration.data;
  }

  private async getMigration(name: string): Promise<Migration | undefined> {
    return Migration.query(this.db)
      .context(this.makeQueryContext())
      .where('name', name)
      .first();
  }
}
