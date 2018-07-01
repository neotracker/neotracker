interface NEOTracker {
  readonly startDB: () => Promise<Knex.Config>;
}
declare const neotracker: NEOTracker;
