/* @flow */
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import * as React from 'react';

// $FlowFixMe
import { labels } from '@neotracker/shared-utils';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
import { globalStats } from '@neo-one/client-switch';
import { Link } from '../../../lib/link';
import { Typography, withStyles } from '../../../lib/base';

import { upsellClickTotal } from '../../../metrics';
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
      Claim GAS, transfer NEO, GAS or other tokens and more with{' '}
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
    onClick: ({ source }) => () => {
      webLogger.info({
        title: 'neotracker_wallet_upsell_click',
        [labels.CLICK_SOURCE]: source,
      });
      globalStats.record([
        {
          measure: upsellClickTotal,
          value: 1,
        },
      ]);
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(WalletPageUpsell): React.ComponentType<ExternalProps>);
