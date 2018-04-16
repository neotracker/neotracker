/* @flow */
/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import type { Variant } from 'material-ui/Typography/Typography';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../../styles/createTheme';
import { AssetNameLinkBase } from '../../asset/lib';

import { fragmentContainer } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import { type CoinTable_coins } from './__generated__/CoinTable_coins.graphql';

import CoinValue from './CoinValue';

import getSortedCoins from './getSortedCoins';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
  },
  firstCol: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing.unit,
  },
  secondCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  value: {
    textAlign: 'right',
  },
});

export const COIN_TABLE_ROW_HEIGHT = 20;

type ExternalProps = {|
  coins: any,
  variant?: Variant,
  component?: string,
  textClassName?: string,
  className?: string,
|};
type InternalProps = {|
  coins: CoinTable_coins,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CoinTable({
  coins,
  variant,
  component,
  textClassName,
  className,
  classes,
}: Props): React.Element<*> {
  const sortedCoins = getSortedCoins(coins);

  const values = [];
  const assets = [];
  sortedCoins.forEach((coin, idx) => {
    values.push(
      <CoinValue
        key={idx}
        className={classNames(classes.value, textClassName)}
        variant={variant}
        component={component}
        value={coin.value}
      />,
    );
    assets.push(
      <AssetNameLinkBase
        key={idx}
        variant={variant}
        component={component}
        asset={(coin.asset: $FlowFixMe)}
      />,
    );
  });

  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.firstCol}>{values}</div>
      <div className={classes.secondCol}>{assets}</div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    coins: graphql`
      fragment CoinTable_coins on Coin @relay(plural: true) {
        value
        asset {
          hash
          symbol
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(CoinTable): React.ComponentType<ExternalProps>);
