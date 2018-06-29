import { Monitor } from '@neo-one/monitor';
// @ts-ignore
import PGPubsub from 'pg-pubsub';
import { Observable, Observer, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { createConnectionString } from './createConnectionString';

export const PROCESSED_NEXT_INDEX = 'processed_next_index';

export interface PubSub<T> {
  readonly next: (value: T) => Promise<void>;
  readonly close: () => void;
  readonly value$: Observable<T>;
}

export interface Options {
  readonly db?: {
    readonly client?: 'pg' | 'sqlite3';
    readonly connection?: {
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

const createPGPubSub = <T>({
  options,
  channel,
  environment,
  monitor,
}: {
  readonly monitor: Monitor;
  readonly channel: string;
  readonly options: Options;
  readonly environment: Environment;
}): PubSub<T> => {
  const pgpubsub = new PGPubsub(
    createConnectionString({
      ...environment,
      ...(options.db === undefined || options.db.connection === undefined ? {} : options.db.connection),
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

  const value$ = Observable.create((observer: Observer<T>) => {
    const listener = (payload: T) => {
      observer.next(payload);
    };
    pgpubsub.addChannel(channel, listener);

    return () => {
      pgpubsub.removeChannel(channel, listener);
    };
  }).pipe(share());

  return {
    next: async (value: T) => {
      await pgpubsub.publish(channel, value);
    },
    value$,
    close: () => {
      pgpubsub.close();
    },
  };
};

export const createPubSub = <T>({
  options,
  channel,
  environment,
  monitor,
}: {
  readonly monitor: Monitor;
  readonly channel: string;
  readonly options: Options;
  readonly environment: Environment;
}): PubSub<T> => {
  if (options.db !== undefined && options.db.client === 'pg') {
    return createPGPubSub({ options, channel, environment, monitor });
  }

  const subject$ = new Subject<T>();

  return {
    next: async (value: T) => {
      subject$.next(value);
    },
    value$: subject$,
    close: () => {
      // do nothing
    },
  };
};
