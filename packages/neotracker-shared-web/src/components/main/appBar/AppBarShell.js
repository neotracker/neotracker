/* @flow */
import * as React from 'react';

import { type HOC, compose } from 'recompose';

import { Paper, withStyles } from '../../../lib/base';
import { HeadroomJS } from '../../../lib/headroom';

const styles = () => ({
  appBar: {
    zIndex: 1100,
  },
});

type ExternalProps = {|
  offset: number,
  disableHidden?: boolean,
  children?: any,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
const AppBarShell = ({
  offset,
  disableHidden,
  children,
  className,
  classes,
}: Props) => (
  <div className={className}>
    <HeadroomJS offset={offset} disableHidden={disableHidden}>
      <Paper className={classes.appBar} square elevation={4}>
        {children}
      </Paper>
    </HeadroomJS>
  </div>
);

const enhance: HOC<*, *> = compose(withStyles(styles));

export default (enhance(AppBarShell): React.ComponentType<ExternalProps>);
