/* @flow */
import { NEO_ASSET_HASH, sanitizeError } from 'neotracker-shared-utils';
import * as React from 'react';
import { type UserAccount, addressToScriptHash } from '@neo-one/client';

import classNames from 'classnames';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withPropsOnChange,
  withStateHandlers,
} from 'recompose';
import { connect } from 'react-redux';
import { graphql } from 'react-relay';

import { type AssetType, api as walletAPI } from '../../../wallet';
import { type Theme } from '../../../styles/createTheme';
import { Button, TextField, Typography, withStyles } from '../../../lib/base';
import { Selector } from '../../../lib/selector';

import { confirmTransaction } from '../../../redux';
import { fragmentContainer } from '../../../graphql/relay';
import { getName } from '../../explorer/asset/lib';
import { getSortedCoins } from '../../explorer/address/lib';

import { type SendTransaction_address } from './__generated__/SendTransaction_address.graphql';

const styles = (theme: Theme) => ({
  assetArea: {
    alignItems: 'center',
    display: 'flex',
    paddingTop: theme.spacing.unit,
  },
  selector: {
    flex: '0 0 auto',
  },
  marginLeft: {
    marginLeft: theme.spacing.unit,
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  account: UserAccount,
  address: any,
  className?: string,
|};
type InternalProps = {|
  address: ?SendTransaction_address,
  coins: $ReadOnlyArray<{
    value: string,
    asset: {
      type: AssetType,
      hash: string,
      precision: number,
      symbol: string,
    },
  }>,
  toAddress: string,
  toAddressValidation: ?string,
  amount: string,
  amountValidation: ?string,
  selectedAssetHash: string,
  onChangeAddress: (event: Object) => void,
  onChangeAmount: (event: Object) => void,
  onSelect: (option: ?Object) => void,
  onConfirmSend: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SendTransaction({
  coins,
  className,
  toAddress,
  toAddressValidation,
  amount,
  amountValidation,
  selectedAssetHash,
  onChangeAddress,
  onChangeAmount,
  onSelect,
  onConfirmSend,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      <TextField
        id="st-address"
        value={toAddress}
        error={toAddressValidation != null && toAddress !== ''}
        subtext={toAddress === '' ? null : toAddressValidation}
        hasSubtext
        onChange={onChangeAddress}
        label="To Address"
      />
      <div className={classes.assetArea}>
        <TextField
          id="st-amount"
          value={amount}
          error={amountValidation != null && amount !== ''}
          subtext={amount === '' ? null : amountValidation}
          hasSubtext
          onChange={onChangeAmount}
          label="Amount"
        />
        <Selector
          className={classNames(classes.selector, classes.marginLeft)}
          id="select-asset"
          label={null}
          helperText="Select Asset"
          options={coins.map(coin => coin.asset).map(asset => ({
            id: asset.hash,
            text: getName(asset.symbol, asset.hash),
            asset,
          }))}
          selectedID={selectedAssetHash}
          onSelect={onSelect}
        />
        <Button
          className={classes.marginLeft}
          variant="raised"
          color="primary"
          disabled={toAddressValidation != null || amountValidation != null}
          onClick={onConfirmSend}
        >
          <Typography className={classes.buttonText} variant="body1">
            SEND
          </Typography>
        </Button>
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment SendTransaction_address on Address {
        coins {
          edges {
            node {
              value
              asset {
                type
                hash
                precision
                symbol
              }
            }
          }
        }
      }
    `,
  }),
  withPropsOnChange(['address'], ({ address }) => ({
    coins: getSortedCoins(
      address == null ? [] : address.coins.edges.map(edge => edge.node),
    ),
  })),
  withStateHandlers(
    () => ({
      toAddress: '',
      toAddressValidation: null,
      amount: '',
      amountValidation: null,
      selectedAssetHash: NEO_ASSET_HASH,
    }),
    { setState: prevState => updater => updater(prevState) },
  ),
  connect(null, dispatch => ({ dispatch })),
  withHandlers({
    onChangeAddress: ({ setState }) => event => {
      const toAddress = event.target.value;
      let toAddressValidation;
      try {
        addressToScriptHash(toAddress);
      } catch (error) {
        toAddressValidation = sanitizeError(error).clientMessage;
      }
      setState(prevState => ({
        ...prevState,
        toAddress,
        toAddressValidation,
      }));
    },
    onChangeAmount: ({ setState, coins, selectedAssetHash }) => event => {
      const amount = event.target.value;
      const amountValidation = walletAPI.validateAmount(
        amount,
        coins.find(coin => coin.asset.hash === selectedAssetHash),
      );
      setState(prevState => ({
        ...prevState,
        amount,
        amountValidation,
      }));
    },
    onSelect: ({ setState, amount, coins }) => option => {
      const selectedAssetHash = option == null ? NEO_ASSET_HASH : option.id;
      const amountValidation = walletAPI.validateAmount(
        amount,
        coins.find(coin => coin.asset.hash === selectedAssetHash),
      );
      setState(prevState => ({
        ...prevState,
        selectedAssetHash,
        amountValidation,
      }));
    },
    onConfirmSend: ({
      account,
      toAddress,
      amount,
      selectedAssetHash,
      coins,
      dispatch,
    }) => () => {
      const coin = coins.find(c => c.asset.hash === selectedAssetHash);
      if (coin != null) {
        dispatch(
          confirmTransaction({
            account,
            address: toAddress,
            amount,
            asset: coin.asset,
          }),
        );
      }
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(SendTransaction): React.ComponentType<ExternalProps>);
