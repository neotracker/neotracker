interface NEOTracker {
  readonly startDB: () => Promise<Knex.Config>;
  readonly addCleanup: (callback: () => Promise<void> | void) => void;
  readonly addTeardownCleanup: (callback: () => Promise<void> | void) => void;
  readonly startButterfly: () => Promise<{ readonly metricsPort: number }>;
  readonly startDiscordAlerter: () => Promise<{ readonly port: number; readonly metricsPort: number }>;
  readonly startWeb: () => Promise<{ readonly metricsPort: number; readonly port: number }>;
  readonly startClientCollector: () => Promise<{ readonly metricsPort: number }>;
  readonly startScrape: () => Promise<{ readonly metricsPort: number }>;
  readonly startNode: () => Promise<{ readonly metricsPort: number; readonly port: number }>;
}
declare const neotracker: NEOTracker;
