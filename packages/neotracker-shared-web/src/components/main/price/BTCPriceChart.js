/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { fragmentContainer } from '../../../graphql/relay';

import { type BTCPriceChart_btc_data_points } from './__generated__/BTCPriceChart_btc_data_points.graphql';
import { type BTCPriceChart_usd_data_points } from './__generated__/BTCPriceChart_usd_data_points.graphql';
import PriceChart from './PriceChart';

type ExternalProps = {|
  usd_data_points: any,
  btc_data_points: any,
  className?: string,
|};
type InternalProps = {|
  usd_data_points: BTCPriceChart_usd_data_points,
  btc_data_points: BTCPriceChart_btc_data_points,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BTCPriceChart({
  usd_data_points,
  btc_data_points,
  className,
}: Props): React.Element<*> {
  return (
    <PriceChart
      className={className}
      usd_data_points={usd_data_points}
      pair_data_points={btc_data_points}
      pairName="BTC"
      pairDecimals={8}
      pairPrefix="฿"
      pairYAxisFormat="฿{value:.5f}"
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    usd_data_points: graphql`
      fragment BTCPriceChart_usd_data_points on DataPoint @relay(plural: true) {
        ...PriceChart_usd_data_points
      }
    `,
    btc_data_points: graphql`
      fragment BTCPriceChart_btc_data_points on DataPoint @relay(plural: true) {
        ...PriceChart_pair_data_points
      }
    `,
  }),
  pure,
);

export default (enhance(BTCPriceChart): React.ComponentType<ExternalProps>);
