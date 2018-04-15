/* @flow */
import Highcharts from 'highcharts/js/highcharts';
import 'highcharts/css/highcharts.css';
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import HighchartBase from './HighchartBase';

const createChart = (element: any, config: Object) =>
  Highcharts.chart(element, config);

type ExternalProps = {|
  config: Object,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Highchart({ config, className }: Props): React.Element<*> {
  return (
    <HighchartBase
      className={className}
      config={config}
      createChart={createChart}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(Highchart): React.ComponentType<ExternalProps>);
