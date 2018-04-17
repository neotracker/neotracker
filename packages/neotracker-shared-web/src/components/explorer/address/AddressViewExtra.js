/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { ExpandoCard } from '../../common/card';
import { TransactionSummary } from '../transaction/summary';

import { fragmentContainer, getID } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import AddressTransactionPagingView from './AddressTransactionPagingView';
import AddressTransferPagingView from './AddressTransferPagingView';
import { type AddressViewExtra_address } from './__generated__/AddressViewExtra_address.graphql';

const styles = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
});

type ExternalProps = {|
  address: any,
  className?: string,
|};
type InternalProps = {|
  address: ?AddressViewExtra_address,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressViewExtra({
  address,
  className,
  classes,
}: Props): React.Element<*> {
  let firstTransaction = null;
  if (address != null && address.first_transaction != null) {
    firstTransaction = (
      <ExpandoCard
        title="First Transaction"
        content={
          <TransactionSummary
            transaction={address.first_transaction}
            addressHash={getID(address.id)}
            alwaysExpand
          />
        }
      />
    );
  }

  const transactions = (
    <ExpandoCard
      title="Transactions"
      content={<AddressTransactionPagingView address={address} />}
    />
  );

  const transfers = (
    <ExpandoCard
      title="Transfers"
      content={<AddressTransferPagingView address={address} />}
    />
  );

  return (
    <div className={classNames(className, classes.root)}>
      {firstTransaction}
      {transactions}
      {transfers}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment AddressViewExtra_address on Address {
        id
        first_transaction {
          ...TransactionSummary_transaction
        }
        ...AddressTransactionPagingView_address
        ...AddressTransferPagingView_address
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(AddressViewExtra): React.ComponentType<ExternalProps>);
