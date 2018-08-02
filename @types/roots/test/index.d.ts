interface NEOTracker {
  readonly startDB: () => Promise<Knex.Config>;
  readonly addCleanup: (callback: () => Promise<void> | void) => void;
  readonly addTeardownCleanup: (callback: () => Promise<void> | void) => void;
  readonly startDiscordAlerter: () => Promise<{ readonly port: number }>;
}
declare const neotracker: NEOTracker;
