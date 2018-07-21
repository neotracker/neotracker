// tslint:disable no-implicit-dependencies
import { CTExample } from 'neotracker-component-explorer';
import * as React from 'react';
import DefaultExportInterfaceProps from './DefaultExportInterfaceProps';

const foo = 'foo';

// tslint:disable-next-line export-name
export const examples: [CTExample<typeof DefaultExportInterfaceProps>] = [
  {
    element: () => <DefaultExportInterfaceProps foo={foo} />,
  },
];
