/* @flow */
import * as React from 'react';
import { type HOC, compose, pure } from 'recompose';
import classNames from 'classnames';
import { sha3_256 } from 'js-sha3';
import { type Theme } from '../../../styles/createTheme';
import { CardMedia, Typography, withStyles } from '../../../lib/base';
import * as routes from '../../../routes';

const styles = (theme: Theme) => ({
  root: {},
  poweredBy: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  media: {
    height: '30px',
    width: 'auto',
    marginLeft: theme.spacing.unit,
  },
  list: {
    paddingLeft: theme.spacing.unit * 2,
  },
  subtitle: {
    fontSize: theme.typography.subtitle1.fontSize,
  },
  point: {
    padding: theme.spacing.unit,
    fontSize: theme.typography.body1.fontSize,
  },
});

const points = [
  'Select the address above that you want your NEO to be sent to.',
  'Enter the amount that you want to purchase (minimum of $20 USD, maximum of $2,200 USD).',
  'Press "Buy Now" and you\'ll be shown the address that the NEO will be sent to.',
  'Press "Buy Now" again and you\'ll be asked for an email address.',
  `Once you're transaction is completed on MoonPay's site you'll be redirected back to NEO Tracker to see your transaction reflected on the Neo blockchain.`,
  'U.S. users cannot currently purchase NEO from MoonPay.',
];

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PoweredByMoonPay({ className, classes }: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <Typography variant="subtitle1" className={classes.subtitle}>
        Thanks to MoonPay, you can now buy NEO with a debit or credit card.
      </Typography>
      <ul className={classNames(className, classes.list)}>
        {points.map((text) => (
          <Typography
            variant="body1"
            className={classes.point}
            key={sha3_256(text)}
          >
            <li>{text}</li>
          </Typography>
        ))}
      </ul>
      <div className={classes.poweredBy}>
        <Typography variant="body1">Powered by</Typography>
        <CardMedia
          component="img"
          className={classes.media}
          src={routes.makePublic('/moonpay_logo.svg')}
          title="MoonPay"
        />
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(PoweredByMoonPay): React.ComponentType<ExternalProps>);
