import { createChild, serverLogger } from '@neotracker/logger';
import { Client, Notification } from 'pg';
import { Observable, Observer, Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { DBClient } from './db';

export const PROCESSED_NEXT_INDEX = 'processed_next_index';

export interface PubSub<T> {
  readonly next: (value: T) => Promise<void>;
  readonly close: () => void;
  readonly value$: Observable<T>;
}

export interface PubSubOptions {
  readonly db?: {
    readonly client: DBClient;
    readonly connection:
      | string
      | {
          readonly database: string;
          readonly host: string;
          readonly port: number;
          readonly user?: string;
          readonly password?: string;
        }
      | {
          readonly filename: string;
        };
  };
  readonly maxAttempts?: number;
  readonly reconnectTimeMS?: number;
}

export interface CreatePubSubOptions {
  readonly db: {
    readonly client: 'pg';
    readonly connection:
      | string
      | {
          readonly database: string;
          readonly host: string;
          readonly port: number;
          readonly user?: string;
          readonly password?: string;
        };
  };
  readonly maxAttempts?: number;
  readonly reconnectTimeMS?: number;
}

const serverDBLogger = createChild(serverLogger, { component: 'database' });

const createPGPubSub = <T>({
  options,
  channel,
}: {
  readonly channel: string;
  readonly options: CreatePubSubOptions;
}): PubSub<T> => {
  const { maxAttempts = 5, reconnectTimeMS = 5000, db } = options;

  let connected = false;

  const clientOptions =
    typeof db.connection === 'string'
      ? {
          connectionString: db.connection,
        }
      : db.connection;

  const createClient = () =>
    new Client({
      ...clientOptions,
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

  const attemptClientEnd = (termClient: Client) =>
    Promise.race([
      new Promise<void>((resolve) => {
        setTimeout(resolve, 5000);
      }),
      termClient.end(),
    ]);

  const closeClient = async () => {
    const currentClient = client;
    client = createClient();
    connected = false;
    try {
      currentClient.removeAllListeners();
      await attemptClientEnd(currentClient);
    } catch (error) {
      serverDBLogger.error({ title: 'pg_pubsub_close_error', error: error.message });
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

  const value$ = new Observable((observer: Observer<T>) => {
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
          serverDBLogger.error({ title: 'pg_pubsub_client_error', error: error.message });
          doListen();
        });
        client.on('end', () => {
          serverDBLogger.error({ title: 'pg_pubsub_client_end_error', error: new Error('Unexpected end') });
          doListen();
        });
        attempts = 0;
      } catch (error) {
        serverDBLogger.error({ title: 'pg_pubsub_error', error: error.message });
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
}: {
  readonly channel: string;
  readonly options: PubSubOptions;
}): PubSub<T> => {
  if (options.db !== undefined && options.db.client === 'pg') {
    return createPGPubSub({ options: options as CreatePubSubOptions, channel });
  }

  const subject$ = new Subject<T>();

  return {
    next: async (value: T) => {
      await new Promise<void>((resolve) => {
        subject$.next(value);
        resolve();
      });
    },
    value$: subject$,
    close: () => {
      // do nothing
    },
  };
};
