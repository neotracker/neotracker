/* tslint:disable: no-any */
import { PExample } from '@neotracker/component-explorer';
import * as React from 'react';
import { concat, interval, of as _of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FromStream } from './FromStream';

// tslint:disable-next-line export-name
export const examples: readonly [PExample<FromStream<number>['props']>, PExample<FromStream<number>['props']>] = [
  {
    element: (ref: string | ((instance: FromStream<number> | null) => any) | React.RefObject<FromStream<number>> | undefined) => (
      <FromStream ref={ref} props$={concat(_of(0), interval(10).pipe(map((idx) => Math.round(idx / 100))))}>
        {(value: number) => (
          <div>
            {value} second
            {value > 1 ? 's' : ''}
          </div>
        )}
      </FromStream>
    ),
  },
  {
    element: (ref: string | React.RefObject<FromStream<number>> | ((instance: FromStream<number> | null) => any) | undefined) => (
      <FromStream ref={ref} props$={_of<number>()}>
        {() => <div>Will not be rendered</div>}
      </FromStream>
    ),
  },
] as any;
