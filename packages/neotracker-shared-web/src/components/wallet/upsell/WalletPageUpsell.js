/* @flow */
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import * as React from 'react';

import { labels } from 'neotracker-shared-utils';

import type { AppContext } from '../../../AppContext';
import { Link } from '../../../lib/link';
import { Typography, withStyles } from '../../../lib/base';

import * as metrics from '../../../metrics';
import * as routes from '../../../routes';

const styles = () => ({
  inline: {
    display: 'inline',
  },
});

type ExternalProps = {|
  source: string,
  className?: string,
|};
type InternalProps = {|
  onClick: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function WalletPageUpsell({
  className,
  onClick,
  classes,
}: Props): React.Element<*> {
  return (
    <Typography className={className}>
      {`Claim GAS, transfer NEO, GAS or other tokens and more with `}
      <Link
        className={classes.inline}
        path={routes.WALLET_HOME}
        onClick={onClick}
        title="NEO Tracker Wallet"
        component="span"
      />
    </Typography>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  withHandlers({
    onClick: ({ source, appContext: appContextIn }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor
        .withLabels({
          [labels.CLICK_SOURCE]: source,
        })
        .log({
          name: 'neotracker_wallet_upsell_click',
          level: 'verbose',
          metric: metrics.NEOTRACKER_WALLET_UPSELL_CLICK_TOTAL,
        });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(WalletPageUpsell): React.ComponentType<ExternalProps>);
