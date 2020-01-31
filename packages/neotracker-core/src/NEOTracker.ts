import { coreLogger, getFinalLogger } from '@neotracker/logger';
import { createFromEnvironment, createTables, dropTables } from '@neotracker/server-db';
import { createScraper$, ScrapeEnvironment, ScrapeOptions } from '@neotracker/server-scrape';
import { createServer$, ServerEnvironment, ServerOptions } from '@neotracker/server-web';
import { finalize } from '@neotracker/shared-utils';
import { concat, defer, merge, Observable, of as _of, Subscription } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';

export interface StartEnvironment {
  readonly metricsPort: number;
  readonly resetDB: boolean;
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
  readonly type: 'all' | 'web' | 'scrape';
}

export class NEOTracker {
  private readonly options$: Observable<Options>;
  private readonly environment: Environment;
  private readonly type: 'all' | 'web' | 'scrape';
  private mutableShutdownInitiated = false;
  private mutableSubscription: Subscription | undefined;

  public constructor({ options$, environment, type }: NEOTrackerOptions) {
    this.options$ = options$;
    this.environment = environment;
    this.type = type;
  }

  public start(): void {
    process.on('uncaughtException', (error) => {
      coreLogger.error({ title: 'service_uncaught_rejection', error: error.message });
      this.shutdown(1);
    });

    process.on('unhandledRejection', () => {
      coreLogger.error({ title: 'service_unhandled_rejection' });
    });

    process.on('SIGINT', () => {
      coreLogger.info({ title: 'service_sigint' });
      this.shutdown(0);
    });

    process.on('SIGTERM', () => {
      coreLogger.info({ title: 'service_sigterm' });
      this.shutdown(0);
    });

    coreLogger.info({ title: 'service_start' });

    const server$ =
      this.type === 'scrape'
        ? _of([])
        : createServer$({
            environment: this.environment.server,
            createOptions$: this.options$.pipe(
              map((options) => ({ options: options.server })),
              distinctUntilChanged(),
            ),
          });

    const scrape$ =
      this.type === 'web'
        ? _of([])
        : createScraper$({
            environment: this.environment.scrape,
            options$: this.options$.pipe(
              map((options) => options.scrape),
              distinctUntilChanged(),
            ),
          });

    this.mutableSubscription = concat(
      defer(async () => {
        const options = await this.options$.pipe(take(1)).toPromise();
        if (this.environment.start.resetDB) {
          await dropTables(createFromEnvironment(options.scrape.db));
        }

        await createTables(createFromEnvironment(options.scrape.db));
      }),
      merge(server$, scrape$),
    ).subscribe({
      complete: () => {
        coreLogger.info({ title: 'service_unexpected_complete' });
        this.shutdown(1);
      },
      error: (error: Error) => {
        coreLogger.error({ title: 'service_unexpected_complete', error: error.message });
        this.shutdown(1);
      },
    });
  }

  public stop(): void {
    this.shutdown(0);
  }

  private shutdown(exitCode: number): void {
    const finalLogger = getFinalLogger(coreLogger);
    if (!this.mutableShutdownInitiated) {
      this.mutableShutdownInitiated = true;
      if (this.mutableSubscription !== undefined) {
        this.mutableSubscription.unsubscribe();
        this.mutableSubscription = undefined;
      }
      finalize
        .wait()
        .then(() => {
          finalLogger.info({ title: 'server_shutdown' }, 'shutting down');
          process.exit(exitCode);
        })
        .catch((error) => {
          finalLogger.error({ title: 'server_shutdown_error', error: error.message }, 'error, shutting down');
          process.exit(1);
        });
    }
  }
}
