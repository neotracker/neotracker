/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { BTCPriceChart, CNYPriceChart, DayPrice } from '../price';

import { fragmentContainer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type TokenMarket_pair_data_points } from './__generated__/TokenMarket_pair_data_points.graphql';
import { type TokenMarket_usd_data_points } from './__generated__/TokenMarket_usd_data_points.graphql';
import { type TokenMarket_current_price } from './__generated__/TokenMarket_current_price.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    chart: {
      marginTop: theme.spacing.unit,
      maxHeight: 256,
      minWidth: 280,
      maxWidth: '100%',
    },
  },
  [theme.breakpoints.up('sm')]: {
    chart: {
      marginRight: theme.spacing.unit * 2,
      maxHeight: 320,
      minWidth: 280,
      maxWidth: '100%',
    },
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap-reverse',
  },
  chart: {
    flex: '10 0 auto',
  },
});

type ExternalProps = {|
  usd_data_points: any,
  pair_data_points: any,
  current_price: any,
  pairType: 'CNY' | 'BTC',
  symbol: string,
  className?: string,
|};
type InternalProps = {|
  usd_data_points: TokenMarket_usd_data_points,
  pair_data_points: TokenMarket_pair_data_points,
  current_price: ?TokenMarket_current_price,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TokenMarket({
  usd_data_points,
  pair_data_points,
  current_price,
  pairType,
  symbol,
  className,
  classes,
}: Props): React.Element<*> {
  let chart;
  if (pairType === 'CNY') {
    chart = (
      <CNYPriceChart
        className={classes.chart}
        usd_data_points={usd_data_points}
        cny_data_points={pair_data_points}
      />
    );
  } else {
    chart = (
      <BTCPriceChart
        className={classes.chart}
        usd_data_points={usd_data_points}
        btc_data_points={pair_data_points}
      />
    );
  }
  return (
    <div className={classNames(className, classes.root)}>
      {chart}
      {<DayPrice current_price={current_price} symbol={symbol} />}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    usd_data_points: graphql`
      fragment TokenMarket_usd_data_points on DataPoint @relay(plural: true) {
        ...BTCPriceChart_usd_data_points
        ...CNYPriceChart_usd_data_points
      }
    `,
    pair_data_points: graphql`
      fragment TokenMarket_pair_data_points on DataPoint @relay(plural: true) {
        ...BTCPriceChart_btc_data_points
        ...CNYPriceChart_cny_data_points
      }
    `,
    current_price: graphql`
      fragment TokenMarket_current_price on CurrentPrice {
        ...DayPrice_current_price
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TokenMarket): React.ComponentType<ExternalProps>);
