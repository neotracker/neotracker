// tslint:disable no-implicit-dependencies
import { CTExample } from 'neotracker-component-explorer';
import * as React from 'react';
import { ConstExportInlineProps } from './ConstExportInlineProps';

class Foo {
  public getFoo(): number {
    return 1.2;
  }
}

// tslint:disable-next-line export-name
export const examples: [CTExample<typeof ConstExportInlineProps>] = [
  {
    element: () => {
      const foo = new Foo();

      return <ConstExportInlineProps foo={Math.round(foo.getFoo())} />;
    },
  },
];
