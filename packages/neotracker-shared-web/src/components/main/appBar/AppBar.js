/* @flow */
import * as React from 'react';

import { type HOC, compose } from 'recompose';

import { type Theme } from '../../../styles/createTheme';

import { withStyles } from '../../../lib/base';

import AppBarDownMD from './AppBarDownMD';
import AppBarUpMD from './AppBarUpMD';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('md')]: {
    appBarUpMD: {
      display: 'none',
    },
    appBarDownMD: {
      display: 'initial',
    },
  },
  [theme.breakpoints.up('md')]: {
    appBarUpMD: {
      display: 'initial',
    },
    appBarDownMD: {
      display: 'none',
    },
  },
  appBarUpMD: {},
  appBarDownMD: {},
});

type ExternalProps = {|
  isWallet: boolean,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
const AppBar = ({ isWallet, classes }: Props) => (
  <div>
    <div className={classes.appBarUpMD}>
      <AppBarUpMD isWallet={isWallet} />
    </div>
    <div className={classes.appBarDownMD}>
      <AppBarDownMD isWallet={isWallet} />
    </div>
  </div>
);

const enhance: HOC<*, *> = compose(withStyles(styles));

export default (enhance(AppBar): React.ComponentType<ExternalProps>);
