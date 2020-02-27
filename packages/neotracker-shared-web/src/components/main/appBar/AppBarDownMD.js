/* @flow */
import { Link } from 'react-router-dom';
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
  Button,
  ClickAwayListener,
  Collapse,
  Icon,
  IconButton,
  Typography,
  withStyles,
} from '../../../lib/base';
import { SearchField } from '../../explorer/search';

import * as routes from '../../../routes';

import AppBarShell from './AppBarShell';
import TitleLink from './TitleLink';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    padding: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
    title: {
      marginRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    padding: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
    title: {
      marginRight: theme.spacing.unit * 2,
    },
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'row',
    height: theme.spacing.unit * 8,
    justifyContent: 'space-between',
  },
  title: {},
  padding: {},
  selected: {
    color: theme.palette.primary.main,
  },
  menuButton: {
    height: theme.spacing.unit * 6,
  },
  menu: {
    display: 'flex',
    borderTop: `1px solid ${theme.custom.lightDivider}`,
    flexDirection: 'column',
    paddingBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
  link: {
    textDecoration: 'none',
  },
  button: {
    width: '100%',
  },
});

type ExternalProps = {|
  isWallet: boolean,
  className?: string,
|};
type InternalProps = {|
  location: Object,
  showMenu: boolean,
  onHideMenu: () => void,
  onShowMenu: () => void,
  onClickButton: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
const AppBarDownMD = ({
  isWallet,
  className,
  location,
  showMenu,
  onHideMenu,
  onShowMenu,
  onClickButton,
  classes,
}: Props) => {
  const buttons = [
    {
      className: classes.button,
      id: 'wallet',
      label: 'Wallet',
      selected: isWallet,
      href: routes.WALLET_HOME,
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
  ];

  const onClickMenu = showMenu ? onHideMenu : onShowMenu;
  return (
    <AppBarShell className={className} disableHidden={showMenu} offset={88}>
      <div className={classNames(classes.header, classes.padding)}>
        <TitleLink className={classes.title} id="AppBarDownMD" />
        <IconButton
          className={classes.menuButton}
          onMouseUp={onClickMenu}
          onTouchEnd={onClickMenu}
        >
          <Icon>menu</Icon>
        </IconButton>
      </div>
      <Collapse in={showMenu} timeout="auto">
        <ClickAwayListener onClickAway={onHideMenu}>
          <div className={classNames(classes.menu, classes.padding)}>
            {buttons.map((button) => (
              <Link key={button.id} className={classes.link} to={button.href}>
                <Button
                  color={button.selected ? 'primary' : 'default'}
                  className={button.className}
                  onClick={onClickButton}
                >
                  <Typography variant="body1">{button.label}</Typography>
                </Button>
              </Link>
            ))}
            <SearchField onSearch={onClickButton} />
          </div>
        </ClickAwayListener>
      </Collapse>
    </AppBarShell>
  );
};

const enhance: HOC<*, *> = compose(
  withState('state', 'setState', () => ({
    showMenu: false,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onHideMenu: ({ setState, showMenu }) => (event) => {
      if (showMenu) {
        event.preventDefault();
        setState((prevState) => ({
          ...prevState,
          showMenu: false,
        }));
      }
    },
    onClickButton: ({ setState, showMenu }) => () => {
      if (showMenu) {
        setState((prevState) => ({
          ...prevState,
          showMenu: false,
        }));
      }
    },
    onShowMenu: ({ setState, showMenu }) => (event) => {
      event.preventDefault();
      if (!showMenu) {
        setState((prevState) => ({
          ...prevState,
          showMenu: true,
        }));
      }
    },
  }),
  withStyles(styles),
  withRouter,
);

export default (enhance(AppBarDownMD): React.ComponentType<ExternalProps>);
