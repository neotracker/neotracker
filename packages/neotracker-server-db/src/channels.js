/* @flow */
import type { Monitor } from '@neo-one/monitor';
import { Observable } from 'rxjs';

import { pubsub } from 'neotracker-server-utils';
import PGPubsub from 'pg-pubsub';

import createConnectionString from './createConnectionString';

export const PROCESSED_NEXT_INDEX = 'processed_next_index';

export type Options = {|
  intervalMS: number,
  db: {
    connection: {|
      user?: string,
      database?: string,
      password?: string,
    |},
  },
|};

export type Environment = {
  host?: string,
  port?: number,
};

export const subscribeProcessedNextIndex = ({
  options,
  environment,
  monitor: monitorIn,
}: {|
  monitor: Monitor,
  options: Options,
  environment: Environment,
|}): Observable<void> =>
  Observable.create(() => {
    const monitor = monitorIn.at('subscribe_processed_next_index');
    const pgpubsub = new PGPubsub(
      createConnectionString({
        ...environment,
        ...options.db.connection,
        readWrite: true,
      }),
      {
        log: (...args) =>
          args[0] != null && args[0] instanceof Error
            ? monitor.logError({ name: 'pg_pubsub_error', error: args[0] })
            : monitor.log({ name: 'pg_pubsub', level: 'verbose' }),
      },
    );

    pgpubsub.addChannel(PROCESSED_NEXT_INDEX, () => {
      pubsub.publish(PROCESSED_NEXT_INDEX, {});
    });

    return () => {
      pgpubsub.close();
    };
  });
