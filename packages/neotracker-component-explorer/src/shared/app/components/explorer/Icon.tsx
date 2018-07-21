import * as React from 'react';

// No idea why I can't get this to work
// tslint:disable-next-line no-any
export const Icon = ({ as: T, ...props }: any) => <T width="1.5em" height="1.5em" {...props} />;
