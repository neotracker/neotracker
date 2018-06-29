import { Monitor } from '@neo-one/monitor';
import { pubsub as globalPubSub } from 'neotracker-server-utils';
import { Observable, Observer } from 'rxjs';
import { share } from 'rxjs/operators';
import { createPubSub, Environment as PubSubEnvironment, Options as PubSubOptions, PubSub } from './createPubSub';

export const PROCESSED_NEXT_INDEX = 'processed_next_index';

export const createProcessedNextIndexPubSub = ({
  options,
  environment,
  monitor,
}: {
  readonly monitor: Monitor;
  readonly options: PubSubOptions;
  readonly environment: PubSubEnvironment;
}): PubSub<{ readonly index: number }> =>
  createPubSub<{ readonly index: number }>({
    options,
    environment,
    monitor: monitor.at('subscribe_processed_next_index'),
    channel: PROCESSED_NEXT_INDEX,
  });

export const subscribeProcessedNextIndex = ({
  options,
  environment,
  monitor,
}: {
  readonly monitor: Monitor;
  readonly options: PubSubOptions;
  readonly environment: PubSubEnvironment;
}): Observable<{ readonly index: number }> =>
  Observable.create((observer: Observer<{ readonly index: number }>) => {
    const pubSub = createProcessedNextIndexPubSub({ options, environment, monitor });
    const subscription = pubSub.value$.subscribe({
      next: (payload) => {
        globalPubSub.publish(PROCESSED_NEXT_INDEX, payload);
        observer.next(payload);
      },
      complete: observer.complete,
      error: observer.error,
    });

    return () => {
      subscription.unsubscribe();
      pubSub.close();
    };
  }).pipe(share());
