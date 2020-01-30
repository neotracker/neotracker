import { pubsub as globalPubSub } from '@neotracker/server-utils';
import { Observable, Observer } from 'rxjs';
import { share } from 'rxjs/operators';
import { createPubSub, PROCESSED_NEXT_INDEX, PubSub, PubSubOptions } from './createPubSub';

// tslint:disable-next-line no-let
let pubSub: PubSub<{ readonly index: number }> | undefined;
export const createProcessedNextIndexPubSub = ({
  options,
}: {
  readonly options: PubSubOptions;
}): PubSub<{ readonly index: number }> => {
  if (pubSub === undefined) {
    pubSub = createPubSub<{ readonly index: number }>({
      options,
      channel: PROCESSED_NEXT_INDEX,
    });
  }

  return pubSub;
};

export const subscribeProcessedNextIndex = ({
  options,
}: {
  readonly options: PubSubOptions;
}): Observable<{ readonly index: number }> =>
  new Observable((observer: Observer<{ readonly index: number }>) => {
    const pubsub = createProcessedNextIndexPubSub({ options });
    const subscription = pubsub.value$.subscribe({
      next: (payload) => {
        globalPubSub.publish(PROCESSED_NEXT_INDEX, payload);
        observer.next(payload);
      },
      complete: observer.complete,
      error: observer.error,
    });

    return () => {
      subscription.unsubscribe();
      pubsub.close();
    };
  }).pipe(share());
