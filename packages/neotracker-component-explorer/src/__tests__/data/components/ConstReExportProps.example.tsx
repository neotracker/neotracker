// tslint:disable no-implicit-dependencies
import { CTExample } from '@neotracker/component-explorer';
import * as React from 'react';
import { ContextProvider, WithContext } from './ConstReExportProps';

// tslint:disable-next-line export-name
export const examples: [CTExample<typeof ContextProvider>] = [
  {
    component: WithContext,
    element: () => {
      const value = <WithContext>{({ foo }) => <div>{foo}</div>}</WithContext>;

      return <ContextProvider value={{ foo: 'foo' }}>{value}</ContextProvider>;
    },
  },
];
