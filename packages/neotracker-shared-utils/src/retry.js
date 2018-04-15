/* @flow */
import type { Monitor } from '@neo-one/monitor';
import { Observable } from 'rxjs/Observable';

import { concatMap, map, retryWhen } from 'rxjs/operators';
import { range } from 'rxjs/observable/range';
import { _throw } from 'rxjs/observable/throw';
import { timer } from 'rxjs/observable/timer';
import { zip } from 'rxjs/observable/zip';

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
          (error, attempt) => [error, attempt],
        ).pipe(
          concatMap(
            ([error, attempt]) =>
              attempt === retryCount ? _throw(error) : timer(intervalMS),
          ),
        ),
      ),
    );
}
