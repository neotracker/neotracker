/* @flow */
import { type HOC, compose, getContext, pure } from 'recompose';
import * as React from 'react';
import { graphql } from 'react-relay';
import { type Theme } from '../../../styles/createTheme';
import { withStyles } from '../../../lib/base';
import { SelectCard } from '../../wallet/select';
import {
  createBaseMoonPayUrl,
  createSafeRetry,
  mapAppOptions,
} from '../../../utils';
import type { AppOptions } from '../../../AppContext';
import { queryRenderer } from '../../../graphql/relay';
import { api as walletAPI } from '../../../wallet';
import { BuyNEOCard } from '../common';
import { type MainSwapViewQueryResponse } from './__generated__/MainSwapViewQuery.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    marginTop: {
      marginTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    marginTop: {
      marginTop: theme.spacing.unit * 2,
    },
  },
  marginTop: {},
});

const safeRetry = createSafeRetry();

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  appOptions: AppOptions,
  account: ?UserAccount,
  wallet: ?LocalWallet,
  props: ?MainSwapViewQueryResponse,
  lastProps: ?MainSwapViewQueryResponse,
  error: ?Error,
  retry: ?() => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function MainExchangeView({
  appOptions,
  account,
  wallet,
  props: propsIn,
  lastProps,
  error: errorIn,
  retry,
  className,
  classes,
}: Props): React.Element<any> {
  if (errorIn != null && retry != null) {
    safeRetry(retry);
  } else {
    safeRetry.cancel();
  }

  const props = propsIn || lastProps;
  const error = props == null ? errorIn : null;
  const address = props == null ? null : props.address;
  const loading = props == null;
  let walletAddress = null;
  if (
    wallet &&
    wallet.userAccount &&
    wallet.userAccount.id &&
    wallet.userAccount.id.address
  ) {
    walletAddress = wallet.userAccount.id.address;
  }

  return (
    <div className={className}>
      <SelectCard
        account={account}
        wallet={wallet}
        address={address || null}
        loading={loading}
        error={error}
        retry={retry}
        swapPage
      />
      <BuyNEOCard
        className={classes.marginTop}
        address={walletAddress || null}
        moonpayUrl={createBaseMoonPayUrl({
          moonpayPublicApiKey: appOptions.moonpayPublicApiKey,
          walletAddress,
          moonpayUrl: appOptions.moonpayUrl,
          redirectLink: appOptions.url,
        })}
      />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  walletAPI.mapCurrentLocalWallet,
  queryRenderer(
    graphql`
      query MainSwapViewQuery($hash: String!) {
        address(hash: $hash) {
          ...SelectCard_address
        }
      }
    `,
    {
      skipNullVariables: true,
      mapPropsToVariables: {
        client: ({ account }: {| account: ?UserAccount |}) =>
          account == null ? null : { hash: account.id.address },
      },
      cacheConfig: { force: true },
    },
  ),
  getContext({ relayEnvironment: () => null }),
  withStyles(styles),
  mapAppOptions,
  pure,
);

export default (enhance(MainExchangeView): React.ComponentType<Props>);
