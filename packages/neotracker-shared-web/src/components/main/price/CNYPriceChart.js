/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { fragmentContainer } from '../../../graphql/relay';

import { type CNYPriceChart_cny_data_points } from './__generated__/CNYPriceChart_cny_data_points.graphql';
import { type CNYPriceChart_usd_data_points } from './__generated__/CNYPriceChart_usd_data_points.graphql';
import PriceChart from './PriceChart';

type ExternalProps = {|
  usd_data_points: any,
  cny_data_points: any,
  className?: string,
|};
type InternalProps = {|
  usd_data_points: CNYPriceChart_usd_data_points,
  cny_data_points: CNYPriceChart_cny_data_points,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CNYPriceChart({
  usd_data_points,
  cny_data_points,
  className,
}: Props): React.Element<*> {
  return (
    <PriceChart
      className={className}
      usd_data_points={usd_data_points}
      pair_data_points={cny_data_points}
      pairName="CNY"
      pairDecimals={2}
      pairPrefix="¥"
      pairYAxisFormat="¥{value:.2f}"
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    usd_data_points: graphql`
      fragment CNYPriceChart_usd_data_points on DataPoint @relay(plural: true) {
        ...PriceChart_usd_data_points
      }
    `,
    cny_data_points: graphql`
      fragment CNYPriceChart_cny_data_points on DataPoint @relay(plural: true) {
        ...PriceChart_pair_data_points
      }
    `,
  }),
  pure,
);

export default (enhance(CNYPriceChart): React.ComponentType<ExternalProps>);
