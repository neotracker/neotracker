/* @flow */
/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
import { type CacheConfig } from 'react-relay/lib/RelayCombinedEnvironmentTypes';
import {
  type Environment,
  type GraphQLTaggedNode,
  type RelayContext,
  type Snapshot,
  type Variables,
} from 'react-relay';
import * as React from 'react';

import _ from 'lodash';
import { type HOC, getContext } from 'recompose';
import { polyfill } from 'react-lifecycles-compat';

import QueryFetcher, { type DataFrom } from './QueryFetcher';

import getDisplayName from './getDisplayName';

type RetryCallbacks = {
  handleDataChange: ({
    error?: Error,
    snapshot?: Snapshot,
  }) => void,
  handleRetryAfterError: (error: Error) => void,
};

export type RenderProps = {|
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
|};

type Props = {
  cacheConfig?: ?CacheConfig,
  dataFrom?: DataFrom,
  environment: Environment,
  query: ?GraphQLTaggedNode,
  render: (renderProps: RenderProps, lastProps: ?Object) => React.Node,
  variables: ?Variables,
  skipNullVariables: boolean,
};

type State = {
  prevPropsEnvironment: Environment,
  prevPropsVariables: Variables,
  prevQuery: ?GraphQLTaggedNode,
  queryFetcher: QueryFetcher,
  relayContextEnvironment: Environment,
  relayContextVariables: Variables,
  renderProps: RenderProps,
  retryCallbacks: RetryCallbacks,
  lastProps: ?Object,
};

function getLoadingRenderProps(): RenderProps {
  return {
    error: null,
    props: null, // `props: null` indicates that the data is being fetched (i.e. loading)
    retry: null,
  };
}

function getEmptyRenderProps(): RenderProps {
  return {
    error: null,
    props: {}, // `props: {}` indicates no data available
    retry: null,
  };
}

function getRenderProps(
  error: ?Error,
  snapshot: ?Snapshot,
  queryFetcher: QueryFetcher,
  retryCallbacks: RetryCallbacks,
): RenderProps {
  return {
    error: error == null ? error : null,
    props: snapshot ? snapshot.data : null,
    retry: () => {
      const syncSnapshot = queryFetcher.retry();
      if (syncSnapshot) {
        retryCallbacks.handleDataChange({ snapshot: syncSnapshot });
      } else if (error) {
        // If retrying after an error and no synchronous result available,
        // reset the render props
        retryCallbacks.handleRetryAfterError(error);
      }
    },
  };
}

function fetchQueryAndComputeStateFromProps(
  props: Props,
  queryFetcher: QueryFetcher,
  retryCallbacks: RetryCallbacks,
): $Shape<State> {
  const { environment, query, variables, skipNullVariables } = props;
  let relayContextVariables = variables || {};
  if (query) {
    const {
      createOperationSelector,
      getRequest,
    } = environment.unstable_internal;
    const request = getRequest(query);

    try {
      let snapshot = null;
      if (!skipNullVariables || variables != null) {
        const operation = createOperationSelector(request, variables || {});
        relayContextVariables = operation.variables;
        snapshot = queryFetcher.fetch({
          cacheConfig: props.cacheConfig,
          dataFrom: props.dataFrom,
          environment,
          onDataChange: retryCallbacks.handleDataChange,
          operation,
        });
        if (!snapshot) {
          return {
            relayContextEnvironment: environment,
            relayContextVariables,
            renderProps: getLoadingRenderProps(),
          };
        }
      }

      if (skipNullVariables && variables == null) {
        snapshot = { data: {} };
      }

      return {
        relayContextEnvironment: environment,
        relayContextVariables,
        renderProps: getRenderProps(
          null,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      };
    } catch (error) {
      return {
        relayContextEnvironment: environment,
        relayContextVariables,
        renderProps: getRenderProps(error, null, queryFetcher, retryCallbacks),
      };
    }
  } else {
    queryFetcher.dispose();

    return {
      relayContextEnvironment: environment,
      relayContextVariables,
      renderProps: getEmptyRenderProps(),
    };
  }
}

const getState = (prevState: Object, state: Object): Object => {
  let { lastProps } = prevState;
  if (state.props == null && prevState.renderProps.props != null) {
    lastProps = prevState.renderProps.props;
  } else if (lastProps == null && state.props != null) {
    lastProps = state.props;
  }
  return {
    ...state,
    lastProps,
  };
};

/**
 * @public
 *
 * Orchestrates fetching and rendering data for a single view or view hierarchy:
 * - Fetches the query/variables using the given network implementation.
 * - Normalizes the response(s) to that query, publishing them to the given
 *   store.
 * - Renders the pending/fail/success states with the provided render function.
 * - Subscribes for updates to the root data and re-renders with any changes.
 */
class ReactRelayQueryRenderer extends React.Component<Props, State> {
  _relayContext: RelayContext;

  state: State;

  constructor(props: Props, context: Object) {
    super(props, context);
    this._relayContext = {
      environment: props.environment,
      variables: props.variables,
    };

    const queryFetcher = new QueryFetcher();
    let retryCallbacks = {
      handleDataChange: () => {},
      handleRetryAfterError: () => {},
    };

    const handleDataChange = ({
      error,
      snapshot,
    }: {
      error?: Error,
      snapshot?: Snapshot,
    }): void => {
      this._setState({
        renderProps: getRenderProps(
          error,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      });
    };

    const handleRetryAfterError = () =>
      this._setState({ renderProps: getLoadingRenderProps() });

    retryCallbacks = {
      handleDataChange,
      handleRetryAfterError,
    };

    this.state = {
      prevPropsEnvironment: props.environment,
      prevPropsVariables: props.variables,
      prevQuery: props.query,
      queryFetcher,
      retryCallbacks,
      ...(fetchQueryAndComputeStateFromProps(
        props,
        queryFetcher,
        retryCallbacks,
      ): $FlowFixMe),
      lastProps: null,
    };
  }

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State,
  ): $Shape<State> | null {
    if (
      prevState.prevQuery !== nextProps.query ||
      prevState.prevPropsEnvironment !== nextProps.environment ||
      !_.isEqual(prevState.prevPropsVariables, nextProps.variables)
    ) {
      return getState(prevState, {
        prevQuery: nextProps.query,
        prevPropsEnvironment: nextProps.environment,
        prevPropsVariables: nextProps.variables,
        ...(fetchQueryAndComputeStateFromProps(
          nextProps,
          prevState.queryFetcher,
          prevState.retryCallbacks,
        ): $FlowFixMe),
      });
    }

    return null;
  }

  componentWillUnmount(): void {
    this.state.queryFetcher.dispose();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      nextProps.render !== this.props.render ||
      // eslint-disable-next-line react/prop-types
      nextState.renderProps !== this.state.renderProps
    );
  }

  getChildContext(): Object {
    return {
      relay: this._relayContext,
    };
  }

  _setState(state: Object): void {
    this.setState((prevState) => getState(prevState, state));
  }

  render() {
    const {
      relayContextEnvironment,
      relayContextVariables,
      renderProps,
      lastProps,
    } = this.state;

    // HACK Mutate the context.relay object before updating children,
    // To account for any changes made by static gDSFP.
    // Updating this value in gDSFP would be less safe, since props changes
    // could be interrupted and we might re-render based on a setState call.
    // Child containers rely on context.relay being mutated (also for gDSFP).
    // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
    this._relayContext.environment = (relayContextEnvironment: IEnvironment);
    this._relayContext.variables = relayContextVariables;

    return this.props.render(renderProps, lastProps);
  }
}
ReactRelayQueryRenderer.childContextTypes = {
  relay: () => null,
};

polyfill(ReactRelayQueryRenderer);

type Config = {|
  mapPropsToVariables?: {
    client: (props: Object, prevProps?: Object) => ?Object,
    server?: (props: Object) => ?Object,
  },
  withPrevProps?: boolean,
  skipNullVariables?: boolean,
  cacheConfig?: ?CacheConfig,
|};
export default (query: GraphQLTaggedNode, configIn?: Config): HOC<*, *> => {
  const config = (configIn || {
    withPrevProps: false,
    skipNullVariables: false,
  }: Config);
  const mapPropsToVariables =
    config.mapPropsToVariables == null
      ? // eslint-disable-next-line
        (props, prevProps) => ({})
      : config.mapPropsToVariables.client;
  const mapServerPropsToVariables =
    config.mapPropsToVariables == null ||
    config.mapPropsToVariables.server == null
      ? // eslint-disable-next-line
        (props, prevProps) => ({})
      : config.mapPropsToVariables.server;
  const withPrevProps = !!config.withPrevProps;
  const skipNullVariables = !!config.skipNullVariables;
  return (WrappedComponent: React.ComponentType<any>) => {
    let component;
    if (withPrevProps) {
      // eslint-disable-next-line
      component = class Component extends React.Component<any, any> {
        _prevProps: Object;

        render(): React.Element<*> {
          const prevProps = this._prevProps;
          this._prevProps = this.props;
          return (
            <ReactRelayQueryRenderer
              environment={this.props.relayEnvironment}
              query={query}
              variables={mapPropsToVariables(this.props, prevProps)}
              render={(renderProps, lastProps) => (
                <WrappedComponent
                  {...this.props}
                  {...renderProps}
                  lastProps={lastProps}
                />
              )}
              skipNullVariables={skipNullVariables}
              cacheConfig={config.cacheConfig}
            />
          );
        }
      };
    } else {
      component = (props: Object) => (
        <ReactRelayQueryRenderer
          environment={props.relayEnvironment}
          query={query}
          variables={mapPropsToVariables(props)}
          render={(renderProps, lastProps) => (
            <WrappedComponent
              {...props}
              {...renderProps}
              lastProps={lastProps}
            />
          )}
          skipNullVariables={skipNullVariables}
          cacheConfig={config.cacheConfig}
        />
      );
    }
    component.displayName = `QueryRenderer(${getDisplayName(
      WrappedComponent,
    )})`;
    const ComponentWithContext = getContext({
      relayEnvironment: () => null,
      appContext: () => null,
    })(component);

    // $FlowFixMe
    ComponentWithContext.asyncBootstrap = async (
      match: Object,
      environment: Environment,
    ) => {
      if (
        config.mapPropsToVariables == null ||
        (config.mapPropsToVariables.client == null ||
          config.mapPropsToVariables.server != null)
      ) {
        let serverQuery = query;
        const serverVariables = mapServerPropsToVariables({ match });
        if (serverQuery && (!skipNullVariables || serverVariables != null)) {
          const {
            createOperationSelector,
            getRequest,
          } = environment.unstable_internal;
          serverQuery = getRequest(serverQuery);
          const operation = createOperationSelector(
            serverQuery,
            serverVariables || {},
          );

          await new Promise((resolve, reject) => {
            environment
              .execute({ operation, cacheConfig: undefined })
              .subscribe({
                next: () => resolve(),
                error: (error) => reject(error),
              });
          });
        }
      }
    };
    return ComponentWithContext;
  };
};
