/* @flow */
import type { Environment } from 'relay-runtime';
import type {
  OperationSelector,
  SelectorStoreUpdater,
} from 'relay-runtime/lib/RelayStoreTypes';
import type RelayObservable from 'relay-runtime/lib/RelayObservable';
import type { ExecutePayload } from 'relay-runtime/lib/RelayNetworkTypes';

import deferrableFragmentKey from 'relay-runtime/lib/deferrableFragmentKey';
import { getOperationVariables } from 'relay-runtime/lib/RelayConcreteVariables';
import { createOperationSelector } from 'relay-runtime/lib/RelayModernOperationSelector';

import normalizePayload from './normalizePayload';

export default ({
  environment,
  operation,
  cacheConfig,
  updater,
}: {|
  environment: Environment,
  operation: OperationSelector,
  cacheConfig?: ?Object,
  updater?: ?SelectorStoreUpdater,
|}): RelayObservable<ExecutePayload> => {
  let optimisticResponse;
  return environment
    .getNetwork()
    .execute(operation.node, operation.variables, {
      ...(cacheConfig || {}),
    })
    .do({
      next: (executePayload) => {
        const responsePayload = normalizePayload(executePayload);
        const { source, fieldPayloads, deferrableSelections } = responsePayload;
        for (const selectionKey of deferrableSelections || new Set()) {
          environment._deferrableSelections.add(selectionKey);
        }
        if (executePayload.isOptimistic) {
          if (optimisticResponse != null) {
            throw new Error(
              'environment.execute: only support one optimistic respnose per ' +
                'execute.',
            );
          }
          optimisticResponse = {
            source,
            fieldPayloads,
          };
          environment._publishQueue.applyUpdate(optimisticResponse);
          environment._publishQueue.run();
        } else {
          if (optimisticResponse) {
            environment._publishQueue.revertUpdate(optimisticResponse);
            optimisticResponse = undefined;
          }
          const writeSelector = createOperationSelector(
            operation.node,
            executePayload.variables || {},
            executePayload.operation,
          );
          if (executePayload.operation.kind === 'DeferrableOperation') {
            const fragmentKey = deferrableFragmentKey(
              executePayload.variables[
                executePayload.operation.rootFieldVariable
              ],
              executePayload.operation.fragmentName,
              getOperationVariables(
                executePayload.operation,
                executePayload.variables,
              ),
            );
            environment._deferrableSelections.delete(fragmentKey);
          }
          environment._publishQueue.commitPayload(
            writeSelector,
            responsePayload,
            updater,
          );
          environment._publishQueue.run();
        }
      },
    })
    .finally(() => {
      if (optimisticResponse) {
        environment._publishQueue.revertUpdate(optimisticResponse);
        optimisticResponse = undefined;
        environment._publishQueue.run();
      }
    });
};
