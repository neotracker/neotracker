/* @flow */
import type { Environment, GraphQLTaggedNode } from 'relay-runtime';
import type { Monitor } from '@neo-one/monitor';
import { Observable } from 'rxjs';

import { distinctUntilChanged, map, skipWhile } from 'rxjs/operators';

import { executeOperation } from '../graphql/relay';

export default ({
  monitor,
  environment,
  taggedNode,
  variables,
  cacheConfig,
}: {|
  monitor: Monitor,
  environment: Environment,
  taggedNode: GraphQLTaggedNode,
  variables?: Object,
  cacheConfig?: $FlowFixMe,
|}): Observable<Object> => {
  const { createOperationSelector, getRequest } = environment.unstable_internal;
  const query = getRequest(taggedNode);
  const operation = createOperationSelector(query, variables || {});

  return Observable.create((observer) =>
    executeOperation({
      environment,
      monitor,
      operation,
      cacheConfig,
    }).subscribe(observer),
  ).pipe(
    skipWhile(() => !environment.check(operation.root)),
    map(() => environment.lookup(operation.fragment).data),
    distinctUntilChanged(),
  );
};
