import { DependencyList, useEffect, useMemo, useRef, useState } from 'react';
import { Observable, Subscription } from 'rxjs';

/**
 * Returns a stream of `Observable` data.
 *
 * The `props$` `Observable` is immediately subscribed on mount so the first render will include any data the observable immediately resolves with. This can be used to render a loading state in combination with `concat` and `of`. See example below.
 *
 * @example
 * import { concat, defer, of as _of } from 'rxjs';
 *
 * const data = useStream(concat(
 *  _of(undefined),
 *  defer(async () => loadData()),
 * ));
 *
 * return data === undefined ? <Loading /> : <Component data={data} />
 */
export function useStream<T>(createStream$: () => Observable<T>, args: DependencyList, initialValue?: T): T {
  const subscriptionRef = useRef<Subscription | undefined>(undefined);
  const setValueRef = useRef<((value: T) => void) | undefined>(undefined);
  const first = useMemo(() => {
    if (subscriptionRef.current !== undefined) {
      subscriptionRef.current.unsubscribe();
    }

    let firstValue = initialValue;
    // tslint:disable-next-line: no-object-mutation
    subscriptionRef.current = createStream$().subscribe({
      next: (nextValue) => {
        firstValue = nextValue;
        if (setValueRef.current !== undefined) {
          setValueRef.current(nextValue);
        }
      },
    });

    return firstValue;
  }, [...args, subscriptionRef, setValueRef]);

  useEffect(
    () => () => {
      if (subscriptionRef.current !== undefined) {
        subscriptionRef.current.unsubscribe();
      }
    },
    [subscriptionRef],
  );
  const [value, setValue] = useState<T | undefined>(first);
  // tslint:disable-next-line: no-object-mutation
  setValueRef.current = setValue;

  return value as T;
}
