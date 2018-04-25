/* @flow */
import { CodedError } from 'neotracker-server-utils';
import type { AppOptions } from 'neotracker-shared-utils';
import type { Monitor } from '@neo-one/monitor';
import { type Observable, empty } from 'rxjs';
import type { RootLoader } from 'neotracker-server-db';

import { type GraphQLResolver } from '../constants';

export type RootCallOptions = {|
  monitor: Monitor,
  appOptions: AppOptions,
  rootLoader: RootLoader,
|};

export default class RootCall {
  static fieldName: string;
  static typeName: string;
  static args: { [fieldName: string]: string };
  static makeResolver(): GraphQLResolver<*> {
    throw new CodedError(CodedError.PROGRAMMING_ERROR);
  }

  static initialize(
    // eslint-disable-next-line
    options$: Observable<RootCallOptions>,
  ): Observable<any> {
    return empty();
  }
}
