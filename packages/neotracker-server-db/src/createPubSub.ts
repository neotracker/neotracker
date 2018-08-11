import { Monitor } from '@neo-one/monitor';
import { Client, Notification } from 'pg';
import { Observable, Observer, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

export const PROCESSED_NEXT_INDEX = 'processed_next_index';

export interface PubSub<T> {
  readonly next: (value: T) => Promise<void>;
  readonly close: () => void;
  readonly value$: Observable<T>;
}

export interface PubSubOptions {
  readonly db?: {
    readonly client?: 'pg' | 'sqlite3';
    readonly connection?: {
      readonly user?: string;
      readonly database?: string;
      readonly password?: string;
    };
  };
  readonly maxAttempts?: number;
  readonly reconnectTimeMS?: number;
}
export interface PubSubEnvironment {
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
  readonly options: PubSubOptions;
  readonly environment: PubSubEnvironment;
}): PubSub<T> => {
  const { maxAttempts = 5, reconnectTimeMS = 5000 } = options;

  let connected = false;
  const createClient = () =>
    new Client({
      ...environment,
      ...(options.db === undefined || options.db.connection === undefined ? {} : options.db.connection),
    });

  let client = createClient();

  const connectClient = async () => {
    if (!connected) {
      connected = true;
      try {
        await client.connect();
      } catch (error) {
        connected = false;
        throw error;
      }
    }
  };

  const closeClient = async () => {
    const currentClient = client;
    client = createClient();
    connected = false;
    try {
      currentClient.removeAllListeners();
      await currentClient.end();
    } catch (error) {
      monitor.logError({ name: 'pg_pubsub_close_error', error });
    }
  };

  const doCloseClient = () => {
    closeClient()
      .then(() => {
        // do nothing
      })
      .catch(() => {
        // do nothing
      });
  };

  const value$ = Observable.create((observer: Observer<T>) => {
    const listener = (data: Notification) => {
      observer.next(data.payload === undefined ? undefined : JSON.parse(data.payload));
    };

    let attempts = 0;
    const listen = async () => {
      try {
        await closeClient();
        await connectClient();
        // tslint:disable-next-line no-any
        (client as any).connection.stream.setKeepAlive(true);
        await client.query(`LISTEN ${channel};`);

        client.on('notification', listener);
        client.on('error', (error) => {
          monitor.logError({ name: 'pg_pubsub_client_error', error });
          doListen();
        });
        client.on('end', () => {
          monitor.logError({ name: 'pg_pubsub_client_end_error', error: new Error('Unexpected end') });
          doListen();
        });
        attempts = 0;
      } catch (error) {
        monitor.logError({ name: 'pg_pubsub_error', error });
        if (attempts >= maxAttempts) {
          throw error;
        }

        attempts += 1;
        await new Promise<void>((resolve) => setTimeout(resolve, reconnectTimeMS));
        await listen();
      }
    };

    const doListen = () => {
      listen()
        .then(() => {
          // do nothing
        })
        .catch((error) => observer.error(error));
    };

    doListen();

    return () => {
      doCloseClient();
    };
  }).pipe(share());

  return {
    next: async (value: T) => {
      await connectClient();
      await client.query('SELECT pg_notify($1, $2);', [channel, JSON.stringify(value)]);
    },
    value$,
    close: () => {
      doCloseClient();
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
  readonly options: PubSubOptions;
  readonly environment: PubSubEnvironment;
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
