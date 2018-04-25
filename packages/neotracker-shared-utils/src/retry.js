/* @flow */
import type { Monitor } from '@neo-one/monitor';
import { Observable, range, timer, throwError, zip } from 'rxjs';

import { concatMap, map, retryWhen } from 'rxjs/operators';

export default function retry<T>({
  monitor,
  name,
  retryCount,
  intervalMS,
}: {|
  monitor: Monitor,
  name: string,
  retryCount: number,
  intervalMS: number,
|}): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) =>
    source.pipe(
      retryWhen(errors$ =>
        zip(
          errors$.pipe(
            map(error => {
              monitor.logError({ name, error });
              return error;
            }),
          ),
          range(0, retryCount + 1),
        ).pipe(
          concatMap(
            ([error, attempt]) =>
              attempt === retryCount ? throwError(error) : timer(intervalMS),
          ),
        ),
      ),
    );
}
