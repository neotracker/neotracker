/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { Highchart } from '../../../lib/chart';

import { fragmentContainer } from '../../../graphql/relay';

import { type PriceChart_pair_data_points } from './__generated__/PriceChart_pair_data_points.graphql';
import { type PriceChart_usd_data_points } from './__generated__/PriceChart_usd_data_points.graphql';

const mapData = (
  dataPoints: PriceChart_usd_data_points | PriceChart_pair_data_points,
) => dataPoints.map(({ time, value }) => [time * 1000, Number(value)]);

type ExternalProps = {|
  usd_data_points: any,
  pair_data_points: any,
  pairName: string,
  pairDecimals: number,
  pairPrefix: string,
  pairYAxisFormat: string,
  className?: string,
|};
type InternalProps = {|
  usd_data_points: PriceChart_usd_data_points,
  pair_data_points: PriceChart_pair_data_points,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PriceChart({
  usd_data_points,
  pair_data_points,
  pairName,
  pairDecimals,
  pairPrefix,
  pairYAxisFormat,
  className,
}: Props): React.Element<*> {
  const yAxis = [
    {
      labels: {
        // eslint-disable-next-line
        format: '${value:.2f}',
      },
      title: {
        enabled: false,
      },
    },
  ];
  const series = [
    {
      name: 'USD',
      type: 'line',
      animation: false,
      yAxis: 0,
      data: mapData(usd_data_points),
      tooltip: {
        valueDecimals: 2,
        valuePrefix: '$',
      },
      marker: {
        enabled: false,
      },
    },
  ];
  if (pair_data_points.length > 0) {
    yAxis.push({
      gridLineWidth: 0,
      title: {
        enabled: false,
      },
      labels: {
        format: pairYAxisFormat,
      },
      opposite: true,
    });
    series.push({
      name: pairName,
      type: 'line',
      animation: false,
      yAxis: 1,
      data: mapData(pair_data_points),
      tooltip: {
        valueDecimals: pairDecimals,
        valuePrefix: pairPrefix,
      },
      marker: {
        enabled: false,
      },
    });
  }
  const config = {
    animation: false,
    legend: {
      enabled: false,
    },
    title: {
      text: null,
    },
    xAxis: [
      {
        gridLineWidth: 1,
        type: 'datetime',
      },
    ],
    yAxis,
    tooltip: {
      shared: true,
    },
    series,
  };
  return <Highchart className={className} config={config} />;
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    usd_data_points: graphql`
      fragment PriceChart_usd_data_points on DataPoint @relay(plural: true) {
        time
        value
      }
    `,
    pair_data_points: graphql`
      fragment PriceChart_pair_data_points on DataPoint @relay(plural: true) {
        time
        value
      }
    `,
  }),
  pure,
);

export default (enhance(PriceChart): React.ComponentType<ExternalProps>);
