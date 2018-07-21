// tslint:disable no-implicit-dependencies
import { CTExample } from '@neotracker/component-explorer';
import * as React from 'react';
import { ConstExportInterfaceProps } from './ConstExportInterfaceProps';

const foo = 'foo';

// tslint:disable-next-line export-name
export const examples: [CTExample<typeof ConstExportInterfaceProps>] = [
  {
    element: () => <ConstExportInterfaceProps foo={foo} />,
  },
];
