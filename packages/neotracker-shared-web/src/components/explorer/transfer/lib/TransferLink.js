/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import { graphql } from 'react-relay';

import { TransactionLink } from '../../transaction/lib';

import { fragmentContainer } from '../../../../graphql/relay';

import { type TransferLink_transfer } from './__generated__/TransferLink_transfer.graphql';

type ExternalProps = {|
  transfer: any,
  className?: string,
|};
type InternalProps = {|
  transfer: TransferLink_transfer,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransferLink({ transfer, className }: Props): React.Element<*> {
  // TODO: Make this link directly to action on transaction page
  const transactionHash = transfer.transaction_hash;
  return (
    <TransactionLink className={className} transactionHash={transactionHash} />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transfer: graphql`
      fragment TransferLink_transfer on Transfer {
        transaction_hash
      }
    `,
  }),
  pure,
);

export default (enhance(TransferLink): React.ComponentType<ExternalProps>);
