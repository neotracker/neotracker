// tslint:disable no-implicit-dependencies
import { CExample } from '@neotracker/component-explorer';
import * as React from 'react';
import { ClassExportInlineProps } from './ClassExportInlineProps';

function foo() {
  return 'foo';
}

// tslint:disable-next-line export-name
export const examples: readonly[CExample<ClassExportInlineProps<string>>] = [
  {
    // tslint:disable-next-line: no-any
    element: () => <ClassExportInlineProps foo={foo()} /> as any,
  },
] as const;
