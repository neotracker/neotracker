import { Monitor } from '@neo-one/monitor';
import { createFromEnvironment, createTables } from '@neotracker/server-db';
import { createScraper$, ScrapeEnvironment, ScrapeOptions } from '@neotracker/server-scrape';
import { createServer$, ServerEnvironment, ServerOptions } from '@neotracker/server-web';
import { finalize } from '@neotracker/shared-utils';
import { concat, defer, merge, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';

export interface StartEnvironment {
  readonly metricsPort: number;
}

export interface Environment {
  readonly server: ServerEnvironment;
  readonly scrape: ScrapeEnvironment;
  readonly start: StartEnvironment;
}

export interface Options {
  readonly server: ServerOptions;
  readonly scrape: ScrapeOptions;
}

export interface NEOTrackerOptions {
  readonly options$: Observable<Options>;
  readonly environment: Environment;
  readonly monitor: Monitor;
}

export class NEOTracker {
  private readonly options$: Observable<Options>;
  private readonly environment: Environment;
  private readonly monitor: Monitor;
  private mutableShutdownInitiated = false;
  private mutableSubscription: Subscription | undefined;

  public constructor({ options$, environment, monitor }: NEOTrackerOptions) {
    this.options$ = options$;
    this.environment = environment;
    this.monitor = monitor;
  }

  public start(): void {
    process.on('uncaughtException', (error) => {
      this.monitor.logError({ name: 'service_uncaught_rejection', error });
      this.shutdown(1);
    });

    process.on('unhandledRejection', (error) => {
      this.monitor.logError({ name: 'service_unhandled_rejection', error });
    });

    process.on('SIGINT', () => {
      this.monitor.log({ name: 'service_sigint' });
      this.shutdown(0);
    });

    process.on('SIGTERM', () => {
      this.monitor.log({ name: 'service_sigterm' });
      this.shutdown(0);
    });

    this.monitor.log({ name: 'service_start' });
    this.monitor.serveMetrics(this.environment.start.metricsPort);

    const server$ = createServer$({
      monitor: this.monitor,
      environment: this.environment.server,
      createOptions$: this.options$.pipe(
        map((options) => ({ options: options.server })),
        distinctUntilChanged(),
      ),
    });

    const scrape$ = createScraper$({
      monitor: this.monitor,
      environment: this.environment.scrape,
      options$: this.options$.pipe(
        map((options) => options.scrape),
        distinctUntilChanged(),
      ),
    });

    this.mutableSubscription = concat(
      defer(async () => {
        const options = await this.options$.pipe(take(1)).toPromise();

        await createTables(
          createFromEnvironment(this.monitor, this.environment.scrape.db, options.scrape.db),
          this.monitor,
        );
      }),
      merge(server$, scrape$),
    ).subscribe({
      complete: () => {
        this.monitor.log({ name: 'service_unexpected_complete' });
        this.shutdown(1);
      },
      error: (error: Error) => {
        this.monitor.logError({ name: 'service_unexpected_complete', error });
        this.shutdown(1);
      },
    });
  }

  public stop(): void {
    this.shutdown(0);
  }

  private shutdown(exitCode: number): void {
    if (!this.mutableShutdownInitiated) {
      this.mutableShutdownInitiated = true;
      if (this.mutableSubscription !== undefined) {
        this.mutableSubscription.unsubscribe();
        this.mutableSubscription = undefined;
      }
      finalize
        .wait()
        .then(() => {
          this.monitor.log({ name: 'server_shutdown' });
          this.monitor.close(() => process.exit(exitCode));
        })
        .catch((error) => {
          this.monitor.logError({ name: 'server_shutdown_error', error });
          this.monitor.close(() => process.exit(1));
        });
    }
  }
}
