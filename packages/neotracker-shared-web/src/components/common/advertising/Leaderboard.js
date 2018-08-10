/* @flow */
import { type HOC, compose } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';

import AdUnit from './AdUnit';
import { Hidden, withStyles } from '../../../lib/base';
import type { Theme } from '../../../styles/createTheme';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      paddingTop: theme.spacing.unit * 2,
    },
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Leaderboard({ classes, className }: Props): React.Element<*> {
  const initialWidth = 'lg';
  return (
    <>
      <Hidden mdUp initialWidth={initialWidth}>
        <AdUnit className={classNames(classes.root, className)}>
          <div
            id="bsap_1308191"
            className="bsarocks bsap_7f3941492a1eed66c7191226643c3c86"
          />
        </AdUnit>
      </Hidden>
      <Hidden mdDown initialWidth={initialWidth}>
        <AdUnit className={classNames(classes.root, className)}>
          <div
            id="bsap_1308190"
            className="bsarocks bsap_7f3941492a1eed66c7191226643c3c86"
          />
        </AdUnit>
      </Hidden>
    </>
  );
}

const enhance: HOC<*, *> = compose(withStyles(styles));

export default (enhance(Leaderboard): React.ComponentType<ExternalProps>);
