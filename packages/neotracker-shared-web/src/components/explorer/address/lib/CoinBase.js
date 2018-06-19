/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../../styles/createTheme';
import { AssetNameLinkBase } from '../../asset/lib';

import { withStyles } from '../../../../lib/base';

import { type Coin_coin } from './__generated__/Coin_coin.graphql';

import CoinValue from './CoinValue';

const styles = (theme: Theme) => ({
  coinValue: {
    display: 'flex',
  },
  value: {
    marginRight: theme.spacing.unit / 2,
  },
});

type ExternalProps = {|
  coin: Coin_coin,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CoinBase({ coin, className, classes }: Props): React.Element<*> {
  return (
    <div className={classNames(classes.coinValue, className)}>
      <CoinValue className={classes.value} value={coin.value} />
      <AssetNameLinkBase asset={(coin.asset: $FlowFixMe)} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(CoinBase): React.ComponentType<ExternalProps>);
