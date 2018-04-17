/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { fragmentContainer } from '../../../../graphql/relay';

import { type Coin_coin } from './__generated__/Coin_coin.graphql';
import CoinBase from './CoinBase';

type ExternalProps = {|
  coin: any,
  className?: string,
|};
type InternalProps = {|
  coin: Coin_coin,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Coin({ coin, className }: Props): React.Element<*> {
  return <CoinBase className={className} coin={coin} />;
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    coin: graphql`
      fragment Coin_coin on Coin {
        value
        asset {
          id
          symbol
        }
      }
    `,
  }),
  pure,
);

export default (enhance(Coin): React.ComponentType<ExternalProps>);
