/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import {
  type HOC,
  compose,
  withHandlers,
  withProps,
  withState,
} from 'recompose';
import { withRouter } from 'react-router';

import { type Theme } from '../../../styles/createTheme';
import {
  ClickAwayListener,
  Collapse,
  Icon,
  IconButton,
  withStyles,
} from '../../../lib/base';
import { SearchField } from '../../explorer/search';
import { Tabs } from '../../../lib/tabs';

import * as routes from '../../../routes';

import AppBarShell from './AppBarShell';
import TitleLink from './TitleLink';

const styles = (theme: Theme) => ({
  header: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.getContrastText(theme.palette.background.paper),
    display: 'flex',
    flexDirection: 'column',
  },
  headerNormal: {
    height: theme.spacing.unit * 8,
  },
  headerWallet: {
    height: theme.spacing.unit * 14,
  },
  mainHeader: {
    alignItems: 'center',
    display: 'flex',
    height: theme.spacing.unit * 8,
    flex: '0 0 auto',
    flexDirection: 'row',
  },
  mainHeaderWallet: {
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
  },
  tabs: {
    alignItems: 'flex-end',
    display: 'flex',
    height: '100%',
  },
  title: {
    marginRight: theme.spacing.unit * 2,
  },
  padding: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  button: {
    height: theme.spacing.unit * 6,
    border: 'none',
  },
  search: {
    alignItems: 'center',
    borderTop: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    paddingBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
});

type ExternalProps = {|
  isWallet: boolean,
  className?: string,
|};
type InternalProps = {|
  location: Object,
  showSearch: boolean,
  onHideSearch: () => void,
  onShowSearch: () => void,
  onSearch: () => void,
  setSearchFieldRef: (ref: any) => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
const AppBarUpMD = ({
  isWallet,
  className,
  location,
  showSearch,
  onHideSearch,
  onShowSearch,
  onSearch,
  setSearchFieldRef,
  classes,
}: Props) => {
  const tabs = (
    <Tabs
      tabs={[
        {
          className: classes.button,
          id: 'wallet',
          label: 'Wallet',
          selected: isWallet,
          href: routes.WALLET_HOME,
        },
        {
          className: classes.button,
          id: 'swap',
          label: 'Buy NEO',
          selected: routes.isSwap(location.pathname),
          href: routes.SWAP,
        },
        {
          className: classes.button,
          id: 'blocks',
          label: 'Blocks',
          selected: routes.isBlock(location.pathname),
          href: routes.makeBlockSearch(1),
        },
        {
          className: classes.button,
          id: 'transactions',
          label: 'Transactions',
          selected: routes.isTransaction(location.pathname),
          href: routes.makeTransactionSearch(1),
        },
        {
          className: classes.button,
          id: 'addresses',
          label: 'Addresses',
          selected: routes.isAddress(location.pathname),
          href: routes.makeAddressSearch(1),
        },
        {
          className: classes.button,
          id: 'assets',
          label: 'Assets',
          selected: routes.isAsset(location.pathname),
          href: routes.makeAssetSearch(1),
        },
        {
          className: classes.button,
          id: 'contracts',
          label: 'Contracts',
          selected: routes.isContract(location.pathname),
          href: routes.makeContractSearch(1),
        },
        {
          className: classes.button,
          id: 'ecosystem',
          label: 'Ecosystem',
          selected: routes.isEcosystem(location.pathname),
          href: routes.ECOSYSTEM,
        },
      ]}
    />
  );

  const onClickSearch = showSearch ? onHideSearch : onShowSearch;
  return (
    <AppBarShell className={className} disableHidden={showSearch} offset={88}>
      <div
        className={classNames({
          [classes.header]: true,
          [classes.headerNormal]: !isWallet,
        })}
      >
        <div
          className={classNames({
            [classes.mainHeader]: true,
            [classes.padding]: true,
          })}
        >
          <TitleLink className={classes.title} id="AppBarUpMD" />
          <div className={classes.tabs}>
            {tabs}
            <IconButton
              className={classes.button}
              onMouseUp={onClickSearch}
              onTouchEnd={onClickSearch}
            >
              <Icon>search</Icon>
            </IconButton>
          </div>
        </div>
      </div>
      <Collapse in={showSearch} timeout="auto">
        <ClickAwayListener onClickAway={onHideSearch}>
          <div className={classNames(classes.search, classes.padding)}>
            <SearchField setInputRef={setSearchFieldRef} onSearch={onSearch} />
          </div>
        </ClickAwayListener>
      </Collapse>
    </AppBarShell>
  );
};

const enhance: HOC<*, *> = compose(
  withState('state', 'setState', () => ({
    showSearch: false,
    searchFieldRef: null,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onHideSearch: ({ setState, showSearch }) => (event) => {
      if (showSearch) {
        event.preventDefault();
        setState((prevState) => ({
          ...prevState,
          showSearch: false,
        }));
      }
    },
    onShowSearch: ({ setState, searchFieldRef, showSearch }) => (event) => {
      event.preventDefault();
      if (!showSearch) {
        setState((prevState) => ({
          ...prevState,
          showSearch: true,
        }));
        if (searchFieldRef != null) {
          searchFieldRef.focus();
        }
      }
    },
    onSearch: ({ setState, showSearch }) => () => {
      if (showSearch) {
        setState((prevState) => ({
          ...prevState,
          showSearch: false,
        }));
      }
    },
    setSearchFieldRef: ({ setState }) => (searchFieldRef) =>
      setState((prevState) => ({
        ...prevState,
        searchFieldRef,
      })),
  }),
  withStyles(styles),
  withRouter,
);

export default (enhance(AppBarUpMD): React.ComponentType<ExternalProps>);
