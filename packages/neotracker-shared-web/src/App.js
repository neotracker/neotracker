/* @flow */
import { type Environment } from 'relay-runtime';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import {
  type HOC,
  compose,
  hoistStatics,
  lifecycle,
  pure,
  withContext,
  withStateHandlers,
} from 'recompose';
// $FlowFixMe
import { labels } from '@neotracker/shared-utils';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
import { withRouter } from 'react-router';

import Address from './pages/Address';
import AddressSearch from './pages/AddressSearch';
import Asset from './pages/Asset';
import AssetSearch from './pages/AssetSearch';
import Block from './pages/Block';
import BlockSearch from './pages/BlockSearch';
import Contract from './pages/Contract';
import ContractSearch from './pages/ContractSearch';
import Error404 from './lib/error/Error404';
import GenericErrorPage from './pages/GenericErrorPage';
import Home from './pages/Home';
import Search from './pages/Search';
import Transaction from './pages/Transaction';
import TransactionSearch from './pages/TransactionSearch';

import Maintenance from './pages/Maintenance';
import MainWallet from './pages/MainWallet';
import CreateKeystore from './pages/CreateKeystore';
import NewWallet from './pages/NewWallet';
import OpenWallet from './pages/OpenWallet';
import WalletFAQ from './pages/WalletFAQ';
import Ecosystem from './pages/Ecosystem';

import AppShell from './AppShell';
import type { AppContext, AppOptions } from './AppContext';

import * as routes from './routes';
import { mapAppOptions } from './utils';

const renderComponent = (Component) => (props: Object) => (
  <Component {...props} />
);

export type RouteConfig = {
  exact: boolean,
  path: string,
  // eslint-disable-next-line
  render: (props: Props) => React.Element<any>,
  component?: React.ComponentType<any>,
  chunkName?: string,
};
export const routeConfigs = [
  {
    exact: true,
    path: routes.HOME,
    render: renderComponent(Home),
    component: Home,
  },
  {
    exact: true,
    path: routes.makeAddressSearch(),
    render: renderComponent(AddressSearch),
    component: AddressSearch,
  },
  {
    exact: true,
    path: routes.makeAddress(),
    render: renderComponent(Address),
    component: Address,
  },
  {
    exact: true,
    path: routes.makeAssetSearch(),
    render: renderComponent(AssetSearch),
    component: AssetSearch,
  },
  {
    exact: true,
    path: routes.makeAsset(),
    render: renderComponent(Asset),
    component: Asset,
  },
  {
    exact: true,
    path: routes.makeBlockSearch(),
    render: renderComponent(BlockSearch),
    component: BlockSearch,
  },
  {
    exact: true,
    path: routes.makeBlockIndex(),
    render: renderComponent(Block),
    component: Block,
  },
  {
    exact: true,
    path: routes.makeBlockHash(),
    render: renderComponent(Block),
    component: Block,
  },
  {
    exact: true,
    path: routes.makeContractSearch(),
    render: renderComponent(ContractSearch),
    component: ContractSearch,
  },
  {
    exact: true,
    path: routes.makeContract(),
    render: renderComponent(Contract),
    component: Contract,
  },
  {
    exact: true,
    path: routes.makeSearch(),
    render: renderComponent(Search),
    component: Search,
  },
  {
    exact: true,
    path: routes.makeTransactionSearch(),
    render: renderComponent(TransactionSearch),
    component: TransactionSearch,
  },
  {
    exact: true,
    path: routes.makeTransaction(),
    render: renderComponent(Transaction),
    component: Transaction,
  },
  {
    exact: true,
    path: routes.WALLET_HOME,
    render: renderComponent(MainWallet),
    component: MainWallet,
  },
  {
    exact: true,
    path: routes.WALLET_CREATE_KEYSTORE,
    render: renderComponent(CreateKeystore),
    component: CreateKeystore,
  },
  {
    exact: true,
    path: routes.WALLET_NEW_WALLET,
    render: renderComponent(NewWallet),
    component: NewWallet,
  },
  {
    exact: true,
    path: routes.WALLET_OPEN_WALLET,
    render: renderComponent(OpenWallet),
    component: OpenWallet,
  },
  {
    exact: true,
    path: routes.WALLET_FAQ,
    render: renderComponent(WalletFAQ),
    component: WalletFAQ,
  },
  {
    exact: true,
    path: routes.ECOSYSTEM,
    render: renderComponent(Ecosystem),
    component: Ecosystem,
  },
  {
    exact: false,
    path: undefined,
    render: renderComponent(Error404),
    component: Error404,
  },
];

type ExternalProps = {|
  relayEnvironment: Environment,
  appContext: AppContext,
|};
type InternalProps = {|
  reactError: boolean,
  appOptions: AppOptions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function App({ reactError, appOptions }: Props): React.Element<*> {
  let content;
  if (appOptions.maintenance) {
    content = <Maintenance />;
  } else if (reactError) {
    content = <GenericErrorPage />;
  } else {
    content = (
      <Switch>
        {routeConfigs.map((config) => (
          <Route
            key={config.path == null ? 'nopath' : config.path}
            exact={config.exact}
            path={config.path}
            render={config.render}
          />
        ))}
      </Switch>
    );
  }
  return <AppShell>{content}</AppShell>;
}

type MatchConfig = {
  route: RouteConfig,
  match: Object,
};
App.asyncBootstrap = async (
  matchConfig: MatchConfig,
  relayEnvironment: Environment,
) => {
  const { component } = matchConfig.route;
  if (component != null && (component: $FlowFixMe).asyncBootstrap != null) {
    // $FlowFixMe
    await component.asyncBootstrap(matchConfig.match, relayEnvironment);
  }
};

const enhance: HOC<*, *> = hoistStatics(
  compose(
    withRouter,
    withStateHandlers(() => ({ reactError: false }), {
      onError: (prevState) => () => ({ ...prevState, reactError: true }),
    }),
    lifecycle({
      componentDidCatch(error, info) {
        webLogger.info({
          title: 'client_uncaught_react_error',
          error: error.message,
          [labels.COMPONENT_STACK]: info.componentStack,
        });
        this.props.onError();
      },
    }),
    withContext(
      {
        relayEnvironment: () => null,
        appContext: () => null,
      },
      ({ relayEnvironment, appContext }) => ({
        relayEnvironment,
        appContext,
      }),
    ),
    mapAppOptions,
    pure,
  ),
);

export default (enhance(App): React.ComponentType<ExternalProps>);
