import { Monitor } from '@neo-one/monitor';
import { pubsub } from 'neotracker-server-utils';
// @ts-ignore
import PGPubsub from 'pg-pubsub';
import { Observable } from 'rxjs';
import { createConnectionString } from './createConnectionString';

export const PROCESSED_NEXT_INDEX = 'processed_next_index';
export interface Options {
  readonly intervalMS: number;
  readonly db: {
    readonly connection: {
      readonly user?: string;
      readonly database?: string;
      readonly password?: string;
    };
  };
}
export interface Environment {
  readonly host?: string;
  readonly port?: number;
}

export const subscribeProcessedNextIndex = ({
  options,
  environment,
  monitor: monitorIn,
}: {
  readonly monitor: Monitor;
  readonly options: Options;
  readonly environment: Environment;
}): Observable<void> =>
  Observable.create(() => {
    const monitor = monitorIn.at('subscribe_processed_next_index');
    const pgpubsub = new PGPubsub(
      createConnectionString({
        ...environment,
        ...options.db.connection,
        readWrite: true,
      }),

      {
        // tslint:disable-next-line no-any
        log: (...args: any[]) => {
          if (args[0] != undefined && args[0] instanceof Error) {
            monitor.logError({ name: 'pg_pubsub_error', error: args[0] });
          } else {
            monitor.log({ name: 'pg_pubsub', level: 'verbose' });
          }
        },
      },
    );

    pgpubsub.addChannel(PROCESSED_NEXT_INDEX, () => {
      pubsub.publish(PROCESSED_NEXT_INDEX, {});
    });

    return () => {
      pgpubsub.close();
    };
  });
