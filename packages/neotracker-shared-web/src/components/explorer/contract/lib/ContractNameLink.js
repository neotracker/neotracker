/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { Link } from '../../../../lib/link';

import { fragmentContainer, getID } from '../../../../graphql/relay';
import * as routes from '../../../../routes';

import { type ContractNameLink_contract } from './__generated__/ContractNameLink_contract.graphql';

type ExternalProps = {|
  contract: any,
  className?: string,
|};
type InternalProps = {|
  contract: ContractNameLink_contract,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractNameLink({ contract, className }: Props): React.Element<*> {
  return (
    <Link
      className={className}
      variant="body1"
      path={routes.makeContract(getID(contract.id))}
      title={contract.name}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    contract: graphql`
      fragment ContractNameLink_contract on Contract {
        id
        name
      }
    `,
  }),
  pure,
);

export default (enhance(ContractNameLink): React.ComponentType<ExternalProps>);
