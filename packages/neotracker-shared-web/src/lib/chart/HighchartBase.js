/* @flow */
/* eslint-disable react/no-string-refs */
import * as React from 'react';

import classNames from 'classnames';
import { withStyles } from '../base';

const styles = (theme: any) => ({
  root: {
    '& .highcharts-container': {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
      fontWeight: theme.typography.fontWeightRegular,
      width: 'initial',
      height: 'initial',
    },
    '& .highcharts-color-0': {
      fill: theme.palette.primary['500'],
      stroke: theme.palette.primary['500'],
    },
    '& .highcharts-color-1': {
      fill: theme.palette.secondary.light,
      stroke: theme.palette.secondary.light,
    },
    '& .highcharts-axis-labels text': {
      ...theme.typography.caption,
      fill: theme.typography.caption.color,
    },
    '& .highcharts-grid-line': {
      fill: theme.custom.lightDivider,
      stroke: theme.custom.lightDivider,
    },
    '& .highcharts-xaxis-grid .highcharts-grid-line': {
      strokeWidth: 1,
    },
    '& .highcharts-tooltip .highcharts-header': {
      fontSize: 12,
    },
    '& .highcharts-tooltip text': {
      ...theme.typography.body1,
      fill: theme.typography.body1.color,
    },
    '& .highcharts-strong': {
      fontWeight: theme.typography.fontWeightMedium,
    },
  },
});

type ExternalProps = {|
  config: Object,
  createChart: (element: any, config: Object) => any,
  neverReflow?: boolean,
  isPureConfig?: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
class HighchartBase extends React.Component<Props, void> {
  chart: any;

  renderChart(config: Object) {
    // eslint-disable-next-line
    this.chart = this.props.createChart(this.refs.chart, {
      ...config,
      credits: {
        enabled: false,
      },
    });

    if (!this.props.neverReflow) {
      if (window && window.requestAnimationFrame) {
        requestAnimationFrame(() => {
          if (this.chart && this.chart.options) {
            this.chart.reflow();
          }
        });
      }
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    if (
      nextProps.neverReflow ||
      (nextProps.isPureConfig && this.props.config === nextProps.config)
    ) {
      return false;
    }
    this.renderChart(nextProps.config);
    return false;
  }

  componentDidMount() {
    this.renderChart(this.props.config);
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  render() {
    return (
      <div
        className={classNames(this.props.className, this.props.classes.root)}
        ref="chart"
      />
    );
  }
}

export default (withStyles(styles)(
  HighchartBase,
): React.ComponentType<ExternalProps>);
