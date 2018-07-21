import * as React from 'react';

// tslint:disable-next-line no-any
const WithCodeRevisionBase = React.createContext<number>(0);

export const CodeRevisionProvider = WithCodeRevisionBase.Provider;
export const WithCodeRevision = WithCodeRevisionBase.Consumer;
