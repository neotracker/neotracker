/* @flow */
// $FlowFixMe
import {
  GAS_ASSET_HASH,
  NEO_ASSET_HASH,
  MINIMUM_NETWORK_FEE,
  sanitizeError,
  tryParseNumber,
  utils,
} from '@neotracker/shared-utils';
import * as React from 'react';
import { type UserAccount, addressToScriptHash } from '@neo-one/client-common';

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
import { Help } from '../../../lib/help';

import { confirmTransaction } from '../../../redux';
import {
  fragmentContainer,
  getID,
  queryRenderer,
} from '../../../graphql/relay';
import { getName } from '../../explorer/asset/lib';
import { getSortedCoins } from '../../explorer/address/lib';
import { formatNumber, getAverage } from '../../../utils';

import { type SendTransaction_address } from './__generated__/SendTransaction_address.graphql';
import { type SendTransactionQuery } from './__generated__/SendTransactionQuery.graphql';

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
  help: {
    paddingLeft: theme.spacing.unit / 2,
  },
  feeArea: {
    alignItems: 'center',
    display: 'flex',
    paddingTop: theme.spacing.unit,
  },
});

type ExternalProps = {|
  account: UserAccount,
  address: any,
  className?: string,
|};
type InternalProps = {|
  props: ?SendTransactionQuery,
  lastProps: ?SendTransactionQuery,
  address: ?SendTransaction_address,
  coins: $ReadOnlyArray<{
    value: string,
    asset: {
      type: AssetType,
      id: string,
      precision: number,
      symbol: string,
    },
  }>,
  toAddress: string,
  toAddressValidation: ?string,
  amount: string,
  feeAmount: string,
  amountValidation: ?string,
  feeAmountValidation: ?string,
  selectedAssetHash: string,
  onChangeAddress: (event: Object) => void,
  onChangeAmount: (event: Object) => void,
  onChangeFee: (event: Object) => void,
  onSelect: (option: ?Object) => void,
  onConfirmSend: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SendTransaction({
  props,
  lastProps,
  coins,
  className,
  toAddress,
  toAddressValidation,
  amount,
  feeAmount,
  amountValidation,
  feeAmountValidation,
  selectedAssetHash,
  onChangeAddress,
  onChangeAmount,
  onChangeFee,
  onSelect,
  onConfirmSend,
  classes,
}: Props): React.Element<*> {
  let currentProps;
  if (props != null) {
    currentProps = props;
  } else if (lastProps != null) {
    currentProps = lastProps;
  }
  const allFees =
    currentProps == null
      ? null
      : currentProps.transactions.edges
          .map((edge) => edge.node.network_fee)
          .map((value) => tryParseNumber({ value, default: null }))
          .filter(utils.notNull);

  const avgFee = allFees == null || allFees === [] ? null : getAverage(allFees);
  const finalFee = avgFee < MINIMUM_NETWORK_FEE ? 0 : avgFee;
  const feeRecommendation =
    avgFee == null
      ? null
      : `Recommended Fee: ${formatNumber(finalFee, {
          decimalPlaces: 8,
          trimZerosUnsafe: true,
        })} GAS`;

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
          options={coins
            .map((coin) => coin.asset)
            .map((asset) => ({
              id: getID(asset.id),
              text: getName(asset.symbol, getID(asset.id)),
              asset,
            }))}
          selectedID={selectedAssetHash}
          onSelect={onSelect}
        />
      </div>
      <div className={classes.feeArea}>
        <TextField
          id="st-fee"
          value={feeAmount}
          error={feeAmountValidation != null && feeAmount !== ''}
          subtext={
            feeAmount === ''
              ? feeRecommendation
              : `${
                  feeAmountValidation == null ? '' : `${feeAmountValidation} `
                }${feeRecommendation}`
          }
          hasSubtext
          onChange={onChangeFee}
          label="Optional Network Fee"
        />
        <Typography className={classes.marginLeft} variant="subheading">
          GAS
        </Typography>
        <Help
          className={classes.help}
          tooltip={`You do not have to include a network fee with your transfer.
          But adding a network fee (minimum ${MINIMUM_NETWORK_FEE} GAS) will grant the transaction
          higher priority and can result in a faster transaction. Our recommended
          fee is the average network fee of the last 30 non-Miner transactions on the blockchain.`}
        />
        <Button
          className={classes.marginLeft}
          variant="contained"
          color="primary"
          disabled={
            toAddressValidation != null ||
            toAddress === '' ||
            amountValidation != null ||
            amount === '' ||
            (feeAmountValidation != null && feeAmount !== '')
          }
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
  queryRenderer(graphql`
    query SendTransactionQuery {
      transactions(
        orderBy: [{ name: "transaction.id", direction: "desc" }]
        filters: [
          {
            name: "transaction.type"
            operator: "!="
            value: "MinerTransaction"
          }
        ]
        first: 30
      ) {
        edges {
          node {
            network_fee
          }
        }
      }
    }
  `),
  fragmentContainer({
    address: graphql`
      fragment SendTransaction_address on Address {
        coins {
          edges {
            node {
              value
              asset {
                type
                id
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
      address == null ? [] : address.coins.edges.map((edge) => edge.node),
    ),
  })),
  withStateHandlers(
    () => ({
      toAddress: '',
      toAddressValidation: null,
      amount: '',
      feeAmount: '',
      amountValidation: null,
      feeAmountValidation: null,
      selectedAssetHash: NEO_ASSET_HASH,
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  connect(
    null,
    (dispatch) => ({ dispatch }),
  ),
  withHandlers({
    onChangeAddress: ({ setState }) => (event) => {
      const toAddress = event.target.value;
      let toAddressValidation;
      try {
        addressToScriptHash(toAddress);
      } catch (error) {
        toAddressValidation = sanitizeError(error).clientMessage;
      }
      setState((prevState) => ({
        ...prevState,
        toAddress,
        toAddressValidation,
      }));
    },
    onChangeAmount: ({ setState, coins, selectedAssetHash }) => (event) => {
      const amount = event.target.value;
      const amountValidation = walletAPI.validateAmount(
        amount,
        coins.find((coin) => getID(coin.asset.id) === selectedAssetHash),
      );
      setState((prevState) => ({
        ...prevState,
        amount,
        amountValidation,
      }));
    },
    onChangeFee: ({ setState, coins }) => (event) => {
      const feeAmount = event.target.value;
      const feeAmountValidation = walletAPI.validateAmount(
        feeAmount,
        coins.find((coin) => getID(coin.asset.id) === GAS_ASSET_HASH),
        '0.001',
      );
      setState((prevState) => ({
        ...prevState,
        feeAmount,
        feeAmountValidation,
      }));
    },
    onSelect: ({ setState, amount, coins }) => (option) => {
      const selectedAssetHash = option == null ? NEO_ASSET_HASH : option.id;
      const amountValidation = walletAPI.validateAmount(
        amount,
        coins.find((coin) => getID(coin.asset.id) === selectedAssetHash),
      );
      setState((prevState) => ({
        ...prevState,
        selectedAssetHash,
        amountValidation,
      }));
    },
    onConfirmSend: ({
      account,
      toAddress,
      amount,
      feeAmount,
      selectedAssetHash,
      coins,
      dispatch,
    }) => () => {
      const coin = coins.find((c) => getID(c.asset.id) === selectedAssetHash);
      if (coin != null) {
        dispatch(
          confirmTransaction({
            account,
            address: toAddress,
            amount,
            asset: coin.asset,
            networkFee: feeAmount === '' ? undefined : feeAmount,
          }),
        );
      }
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(SendTransaction): React.ComponentType<ExternalProps>);
