import { globalStats } from '@neo-one/client-switch';
import * as React from 'react';
import LoadableExport, { LoadableComponent } from 'react-loadable';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { AppContext } from './AppContext';
import { AppShell } from './AppShell';
import { sessionCounter } from './metrics';
import * as routes from './routes';

interface RouteConfig {
  readonly exact: boolean;
  readonly path?: string;
  // tslint:disable-next-line no-any
  readonly component: React.ComponentType<RouteComponentProps<any>> & LoadableComponent;
}
export const ROUTE_CONFIGS: ReadonlyArray<RouteConfig> = [
  {
    exact: true,
    path: routes.HOME,
    component: LoadableExport({
      // tslint:disable-next-line promise-function-async
      loader: () => import('./pages/Home').then((value) => value.Home),
      // tslint:disable-next-line no-null-keyword
      loading: () => null,
    }),
  },
  {
    exact: false,
    path: undefined,
    component: LoadableExport({
      // tslint:disable-next-line promise-function-async
      loader: () => import('./pages/Error404').then((value) => value.Error404),
      // tslint:disable-next-line no-null-keyword
      loading: () => null,
    }),
  },
];

const ROUTE_CONFIGS_WITH_RENDER = ROUTE_CONFIGS.map((config) => ({
  ...config,
  // tslint:disable-next-line no-any no-unnecessary-type-annotation
  render: (props: RouteComponentProps<any>) => {
    const { component: Component } = config;
    if (props.staticContext !== undefined) {
      if (config.exact) {
        // tslint:disable-next-line no-object-mutation no-any
        (props.staticContext as any).routePath = props.match.path;
      } else {
        // tslint:disable-next-line no-object-mutation no-any
        (props.staticContext as any).missed = true;
      }
    }

    return <Component {...props} />;
  },
}));

export interface ExternalProps {
  readonly appContext: AppContext;
}

export class App extends React.Component<ExternalProps> {
  public render() {
    return (
      <AppShell appContext={this.props.appContext}>
        <Switch>
          {ROUTE_CONFIGS_WITH_RENDER.map((config) => (
            <Route
              key={config.path === undefined ? 'nopath' : config.path}
              exact={config.exact}
              path={config.path}
              render={config.render}
            />
          ))}
        </Switch>
      </AppShell>
    );
  }

  public componentDidMount() {
    globalStats.record([
      {
        measure: sessionCounter,
        value: 1,
      },
    ]);
  }
}
