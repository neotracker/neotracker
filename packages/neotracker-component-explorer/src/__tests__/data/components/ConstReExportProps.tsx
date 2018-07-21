import * as React from 'react';

interface Props {
  readonly foo: string;
}
const ContextBase = React.createContext<Props>({ foo: 'foo' });

export const ContextProvider = ContextBase.Provider;
export const WithContext = ContextBase.Consumer;
