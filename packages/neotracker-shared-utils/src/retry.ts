import { Monitor } from '@neo-one/monitor';
import { Observable, range, throwError, timer, zip } from 'rxjs';
import { concatMap, map, retryWhen } from 'rxjs/operators';

export function retry<T>({
  monitor,
  name,
  retryCount,
  intervalMS,
}: {
  readonly monitor: Monitor;
  readonly name: string;
  readonly retryCount: number;
  readonly intervalMS: number;
}): ((source$: Observable<T>) => Observable<T>) {
  return (source$) =>
    source$.pipe(
      retryWhen((errors$) =>
        zip(
          errors$.pipe(
            map((error) => {
              monitor.logError({ name, error });

              return error;
            }),
          ),
          range(0, retryCount + 1),
        ).pipe(concatMap(([error, attempt]) => (attempt === retryCount ? throwError(error) : timer(intervalMS)))),
      ),
    );
}
