/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import AdUnit from './AdUnit';
import { Hidden, withStyles } from '../../../lib/base';
import type { Theme } from '../../../styles/createTheme';

const styles = (theme: Theme) => ({
  root: {
    '& div.pc_block_active': {
      marginBottom: theme.spacing.unit,
      marginTop: theme.spacing.unit,
    },
  },
});

type ExternalProps = {||};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Leaderboard({ classes }: Props): React.Element<*> {
  const initialWidth = 'lg';
  return (
    <div className={classes.root}>
      <Hidden mdUp initialWidth={initialWidth}>
        <AdUnit
          getZoneID={({ adclerks }) =>
            ((adclerks || {}).zones || {}).mobileLeaderboard
          }
        />
      </Hidden>
      <Hidden mdDown initialWidth={initialWidth}>
        <AdUnit
          getZoneID={({ adclerks }) =>
            ((adclerks || {}).zones || {}).leaderboard
          }
        />
      </Hidden>
    </div>
  );
}

const enhance: HOC<*, *> = compose(withStyles(styles), pure);

export default (enhance(Leaderboard): React.ComponentType<ExternalProps>);
