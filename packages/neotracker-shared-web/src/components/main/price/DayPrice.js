/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { TimeAgo } from '../../common/timeago';
import { Typography, withStyles } from '../../../lib/base';

import { formatNumber } from '../../../utils';
import { fragmentContainer } from '../../../graphql/relay';

import { type DayPrice_current_price } from './__generated__/DayPrice_current_price.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    priceHeader: {
      paddingLeft: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    priceHeader: {
      paddingLeft: theme.spacing.unit * 2,
    },
  },
  root: {
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column',
    minWidth: theme.spacing.unit * 35,
  },
  header: {
    display: 'flex',
    flex: '0 0 auto',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    paddingBottom: theme.spacing.unit,
  },
  body: {
    display: 'flex',
    flex: '0 0 auto',
    flexDirection: 'column',
    paddingBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    flex: '0 0 auto',
    paddingBottom: theme.spacing.unit,
  },
  entry: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  entryPadding: {
    paddingBottom: theme.spacing.unit / 2,
  },
  entryValue: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  green: {
    color: theme.custom.colors.green[500],
  },
  red: {
    color: theme.custom.colors.red[500],
  },
  title: {
    color: theme.typography.body1.color,
  },
  price: {
    color: theme.typography.body1.color,
  },
  priceHeader: {
    paddingTop: theme.spacing.unit,
  },
});

type ExternalProps = {|
  current_price: any,
  symbol: string,
  className?: string,
|};
type InternalProps = {|
  current_price: ?DayPrice_current_price,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function DayPrice({
  current_price,
  symbol,
  className,
  classes,
}: Props): React.Element<*> | null {
  if (current_price == null) {
    return null;
  }

  const makeEntry = (label, value, valueClassName, last) => (
    <div
      className={classNames({
        [classes.entry]: true,
        [classes.entryPadding]: !last,
      })}
    >
      <Typography variant="body1">{`${label}:`}</Typography>
      <Typography
        className={classNames(classes.entryValue, valueClassName)}
        variant="body1"
      >
        {value}
      </Typography>
    </div>
  );

  const formatUSD = (value) => formatNumber(value, { decimalPlaces: 2 });
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.header}>
        <Typography className={classes.title} variant="display1">
          {`${symbol}`}
        </Typography>
      </div>
      <div className={classNames(classes.header, classes.priceHeader)}>
        <Typography className={classes.price} variant="display3" component="h2">
          {`$ ${formatUSD(current_price.price_usd)}`}
        </Typography>
      </div>
      <div className={classes.body}>
        {makeEntry(
          '24h Change',
          `${formatNumber(current_price.percent_change_24h)}%`,
          classNames({
            [classes.red]: current_price.percent_change_24h < 0,
            [classes.green]: current_price.percent_change_24h >= 0,
          }),
        )}
        {makeEntry(
          '24h Volume',
          `$ ${formatUSD(current_price.volume_usd_24h)}`,
        )}
        {makeEntry(
          'Market Cap',
          `$ ${formatUSD(current_price.market_cap_usd)}`,
          undefined,
          true,
        )}
      </div>
      <div className={classes.footer}>
        <TimeAgo
          variant="caption"
          time={current_price.last_updated}
          prefix="Last Updated: "
        />
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    current_price: graphql`
      fragment DayPrice_current_price on CurrentPrice {
        price_usd
        percent_change_24h
        volume_usd_24h
        market_cap_usd
        last_updated
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(DayPrice): React.ComponentType<ExternalProps>);
