import { match } from 'react-router';
import { AppContext } from '../AppContext';

// tslint:disable-next-line no-any
export interface RouteQueryClass<T> {
  readonly fetchDataForRoute: (appContext: AppContext, matchConfig: match<T>) => Promise<void>;
}
