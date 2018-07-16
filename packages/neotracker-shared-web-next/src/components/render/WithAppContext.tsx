import * as React from 'react';
import { AppContext as AppContextType } from '../../AppContext';

// tslint:disable-next-line no-any
const WithAppContextBase = React.createContext<AppContextType>(undefined as any);

export const AppContextProvider = WithAppContextBase.Provider;
export const WithAppContext = WithAppContextBase.Consumer;
