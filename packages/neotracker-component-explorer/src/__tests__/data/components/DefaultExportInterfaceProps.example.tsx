// tslint:disable no-implicit-dependencies
import { CTExample } from '@neotracker/component-explorer';
import * as React from 'react';
// tslint:disable-next-line no-default-import
import DefaultExportInterfaceProps from './DefaultExportInterfaceProps';

const foo = 'foo';

// tslint:disable-next-line export-name
export const examples: readonly[CTExample<typeof DefaultExportInterfaceProps>] = [
  {
    // tslint:disable-next-line: no-any
    element: () => <DefaultExportInterfaceProps foo={foo} /> as any,
  },
] as const;
