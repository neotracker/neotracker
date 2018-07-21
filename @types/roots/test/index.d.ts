interface NEOTracker {
  readonly startDB: () => Promise<Knex.Config>;
  readonly addCleanup: (callback: () => Promise<void> | void) => void;
  readonly addTeardownCleanup: (callback: () => Promise<void> | void) => void;
}
declare const neotracker: NEOTracker;
