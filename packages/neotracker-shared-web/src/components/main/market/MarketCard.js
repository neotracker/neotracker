/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withProps,
  withState,
} from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { Card, Typography, withStyles } from '../../../lib/base';

import { fragmentContainer } from '../../../graphql/relay';

import { type MarketCard_neo_usd_data_points } from './__generated__/MarketCard_neo_usd_data_points.graphql';
import { type MarketCard_neo_btc_data_points } from './__generated__/MarketCard_neo_btc_data_points.graphql';
import { type MarketCard_neo_current_price } from './__generated__/MarketCard_neo_current_price.graphql';
import TokenMarket from './TokenMarket';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    content: {
      padding: theme.spacing.unit,
    },
    cardHeader: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    content: {
      padding: theme.spacing.unit * 2,
    },
    cardHeader: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },
  rightHeader: {
    alignItems: 'flex-end',
    display: 'flex',
  },
  content: {},
  innerContent: {
    position: 'relative',
  },
  gasMarket: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  tokenButton: {
    height: 32,
    marginBottom: -8,
    marginTop: -8,
    paddingBottom: 0,
    paddingTop: 0,
  },
});

/*
<Card className={classNames(className, classes.root)}>
  <div className={classes.cardHeader}>
    <Typography
      variant="title"
    >
      Market
    </Typography>
    <div className={classes.rightHeader}>
      {makeButton('NEO')}
      {makeButton('GAS')}
    </div>
  </div>
  <div className={classes.content}>
    <div className={classes.innerContent}>
      <Slide
        in={token === 'NEO'}
        direction="right"
        transitionAppear={false}
      >
        <TokenMarket
          usd_data_points={neo_usd_data_points}
          pair_data_points={neo_btc_data_points}
          current_price={neo_current_price}
          pairType="BTC"
          symbol="NEO"
        />
      </Slide>
      <Slide
        className={classes.gasMarket}
        in={token === 'GAS'}
        direction="left"
        transitionAppear={false}
      >
        <TokenMarket
          usd_data_points={gas_usd_data_points}
          pair_data_points={gas_cny_data_points}
          current_price={gas_current_price}
          pairType="CNY"
          symbol="GAS"
        />
      </Slide>
    </div>
  </div>
</Card>
*/

type Token = 'NEO' | 'GAS';

type ExternalProps = {|
  neo_usd_data_points: any,
  neo_btc_data_points: any,
  neo_current_price: any,
  className?: string,
|};
type InternalProps = {|
  neo_usd_data_points: MarketCard_neo_usd_data_points,
  neo_btc_data_points: MarketCard_neo_btc_data_points,
  neo_current_price: ?MarketCard_neo_current_price,
  token: Token,
  onClickNEO: () => void,
  onClickGAS: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function MarketCard({
  neo_usd_data_points,
  neo_btc_data_points,
  neo_current_price,
  className,
  // token,
  // onClickNEO,
  // onClickGAS,
  classes,
}: Props): React.Element<*> {
  // const makeButton = (buttonToken: Token) => (
  //   <Button
  //     className={classes.tokenButton}
  //     dense
  //     color={token === buttonToken ? "primary" : "default"}
  //     onClick={buttonToken === 'NEO' ? onClickNEO : onClickGAS}
  //   >
  //     <Typography variant="body1" color="inherit">
  //       {buttonToken}
  //     </Typography>
  //   </Button>
  // )

  return (
    <Card className={classNames(className, classes.root)}>
      <div className={classes.cardHeader}>
        <Typography variant="title">Market</Typography>
      </div>
      <div className={classes.content}>
        <div className={classes.innerContent}>
          <TokenMarket
            usd_data_points={neo_usd_data_points}
            pair_data_points={neo_btc_data_points}
            current_price={neo_current_price}
            pairType="BTC"
            symbol="NEO"
          />
        </div>
      </div>
    </Card>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    neo_usd_data_points: graphql`
      fragment MarketCard_neo_usd_data_points on DataPoint
        @relay(plural: true) {
        ...TokenMarket_usd_data_points
      }
    `,
    neo_btc_data_points: graphql`
      fragment MarketCard_neo_btc_data_points on DataPoint
        @relay(plural: true) {
        ...TokenMarket_pair_data_points
      }
    `,
    neo_current_price: graphql`
      fragment MarketCard_neo_current_price on CurrentPrice {
        ...TokenMarket_current_price
      }
    `,
  }),
  withState('state', 'setState', () => ({
    token: 'NEO',
  })),
  withProps(({ state }) => state),
  withHandlers({
    onClickNEO: ({ token, setState }) => () => {
      if (token !== 'NEO') {
        setState(prevState => ({
          ...prevState,
          token: 'NEO',
        }));
      }
    },
    onClickGAS: ({ token, setState }) => () => {
      if (token !== 'GAS') {
        setState(prevState => ({
          ...prevState,
          token: 'GAS',
        }));
      }
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(MarketCard): React.ComponentType<ExternalProps>);
