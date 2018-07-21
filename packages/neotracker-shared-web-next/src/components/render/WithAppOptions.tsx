import { AppOptions } from '@neotracker/shared-utils';
import * as React from 'react';
import { FromStream } from './FromStream';
import { WithAppContext } from './WithAppContext';

export const WithAppOptions = ({ children }: { readonly children: (appOptions: AppOptions) => React.ReactNode }) => (
  <WithAppContext>{({ options$ }) => <FromStream props$={options$}>{children}</FromStream>}</WithAppContext>
);
