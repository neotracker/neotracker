import { merge, Observable } from 'rxjs';
import { RootCallOptions } from '../lib';
import { roots } from './roots';

// tslint:disable-next-line no-any export-name
export const start$ = (options$: Observable<RootCallOptions>): Observable<any> =>
  merge(...roots().map((rootCall) => rootCall.initialize$(options$)));
