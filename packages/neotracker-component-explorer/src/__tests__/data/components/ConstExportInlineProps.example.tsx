// tslint:disable no-implicit-dependencies
import { CTExample } from '@neotracker/component-explorer';
import * as React from 'react';
import { ConstExportInlineProps } from './ConstExportInlineProps';

class Foo {
  public getFoo(): number {
    return 1.2;
  }
}

// tslint:disable-next-line export-name
export const examples: readonly[CTExample<typeof ConstExportInlineProps>] = [
  {
    element: () => {
      const foo = new Foo();

      // tslint:disable-next-line: no-any
      return <ConstExportInlineProps foo={Math.round(foo.getFoo())} /> as any;
    },
  },
] as const;
