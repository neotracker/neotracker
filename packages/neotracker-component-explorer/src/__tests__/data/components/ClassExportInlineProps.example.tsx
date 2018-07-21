// tslint:disable no-implicit-dependencies
import { CExample } from '@neotracker/component-explorer';
import * as React from 'react';
import { ClassExportInlineProps } from './ClassExportInlineProps';

function foo() {
  return 'foo';
}

// tslint:disable-next-line export-name
export const examples: [CExample<ClassExportInlineProps<string>>] = [
  {
    element: () => <ClassExportInlineProps foo={foo()} />,
  },
];
