// tslint:disable no-implicit-dependencies
import { CExample } from '@neotracker/component-explorer';
import * as React from 'react';
import { RefAccess } from './RefAccess';

// tslint:disable-next-line export-name
export const examples: readonly[CExample<RefAccess>] = [
  {
    // tslint:disable-next-line: no-any
    element: (ref: any) => <RefAccess ref={ref} />,
  },
] as const;
