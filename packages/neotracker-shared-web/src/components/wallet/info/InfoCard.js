/* @flow */
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';
import type { LocalWallet } from '@neo-one/client-core';

import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { TitleCard } from '../../../lib/layout';

import { withStyles } from '../../../lib/base';

import InfoView from './InfoView';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    content: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    content: {
      padding: theme.spacing.unit * 2,
    },
  },
  content: {},
});

type ExternalProps = {|
  account: ?UserAccount,
  wallet: ?LocalWallet,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function InfoCard({
  account,
  wallet,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <TitleCard className={className} title="Details" titleComponent="h2">
      <div className={classes.content}>
        <InfoView account={account} wallet={wallet} />
      </div>
    </TitleCard>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(InfoCard): React.ComponentType<ExternalProps>);
