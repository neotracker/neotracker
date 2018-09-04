import { interval, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';

export function resolveWith<T>(value: T, timeoutMS = 0) {
  return () => timer(timeoutMS).pipe(map(() => value));
}

export function resolveWithInterval<T>(values: ReadonlyArray<T>, intervalMS: number) {
  return () =>
    interval(intervalMS).pipe(
      take(values.length),
      map((idx) => values[idx]),
    );
}

export function resolveWithIntervalLoop<T>(values: ReadonlyArray<T>, intervalMS: number) {
  return () => interval(intervalMS).pipe(map((idx) => values[idx % values.length]));
}
