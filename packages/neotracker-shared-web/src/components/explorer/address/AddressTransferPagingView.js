/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { TransferPagingView } from '../transfer';

import {
  fragmentContainer,
  getID,
  queryRenderer,
} from '../../../graphql/relay';
import { getPagingVariables } from '../../../utils';

import { type AddressTransferPagingView_address } from './__generated__/AddressTransferPagingView_address.graphql';
import { type AddressTransferPagingViewQueryResponse } from './__generated__/AddressTransferPagingViewQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  address: any,
  className?: string,
|};
type InternalProps = {|
  address: ?AddressTransferPagingView_address,
  props: ?AddressTransferPagingViewQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?AddressTransferPagingViewQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressTransferPagingView({
  address,
  className,
  props,
  error,
  lastProps,
  page,
  onUpdatePage,
}: Props): React.Element<*> {
  let currentProps;
  if (props != null) {
    currentProps = props;
  } else if (lastProps != null) {
    currentProps = lastProps;
  }

  let transfers = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const currentAddress = currentProps == null ? null : currentProps.address;
  if (currentAddress != null) {
    transfers = currentAddress.transfers.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = currentAddress.transfers.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <TransferPagingView
      className={className}
      transfers={transfers}
      isInitialLoad={currentProps == null}
      isLoadingMore={props == null}
      error={error == null ? null : sanitizeError(error).clientMessage}
      page={page}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      pageSize={PAGE_SIZE}
      onUpdatePage={onUpdatePage}
      addressHash={address == null ? undefined : getID(address.id)}
    />
  );
}

const mapPropsToVariables = ({
  address,
  page,
}: {|
  address: AddressTransferPagingView_address,
  page: number,
|}) =>
  address == null
    ? null
    : {
        hash: getID(address.id),
        ...getPagingVariables(PAGE_SIZE, page),
      };

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment AddressTransferPagingView_address on Address {
        id
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query AddressTransferPagingViewQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        address(hash: $hash) {
          id
          transfers(
            first: $first
            after: $after
            orderBy: [
              {
                name: "address_to_transfer.id2"
                direction: "desc"
                type: "literal"
              }
            ]
          ) {
            edges {
              node {
                ...TransferPagingView_transfers
              }
            }
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
          }
        }
      }
    `,
    {
      mapPropsToVariables: {
        client: mapPropsToVariables,
      },
      skipNullVariables: true,
    },
  ),
  pure,
);

export default (enhance(
  AddressTransferPagingView,
): React.ComponentType<ExternalProps>);
