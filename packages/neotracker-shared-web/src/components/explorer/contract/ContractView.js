/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PageView } from '../../common/view';

import { fragmentContainer, getID } from '../../../graphql/relay';
import * as routes from '../../../routes';

import { type ContractView_contract } from './__generated__/ContractView_contract.graphql';
import ContractViewExtra from './ContractViewExtra';

type ExternalProps = {|
  contract: any,
  className?: string,
|};
type InternalProps = {|
  contract: ContractView_contract,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractView({ contract, className }: Props): React.Element<*> {
  const columns = [
    ['Hash', getID(contract.id)],
    ['Name', contract.name],
    ['Version', contract.version],
    ['Parameters', contract.parameters_raw],
    ['Return Type', contract.return_type],
    ['Uses Storage', contract.needs_storage ? 'Yes' : 'No'],
    ['Author', contract.author],
    ['Email', contract.email],
    ['Description', contract.description],
  ];

  return (
    <PageView
      className={className}
      id={getID(contract.id)}
      title="Contract"
      name="Contract"
      pluralName="Contracts"
      searchRoute={routes.makeContractSearch(1)}
      bodyColumns={columns}
      extra={<ContractViewExtra contract={contract} />}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    contract: graphql`
      fragment ContractView_contract on Contract {
        id
        name
        version
        parameters_raw
        return_type
        needs_storage
        author
        email
        description
        ...ContractViewExtra_contract
      }
    `,
  }),
  pure,
);

export default (enhance(ContractView): React.ComponentType<ExternalProps>);
