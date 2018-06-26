/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { ContractLink } from './lib';
import { Table } from '../../common/table';
import { TransactionTimeLink } from '../transaction/lib';

import { fragmentContainer, getID } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type ContractTable_contracts } from './__generated__/ContractTable_contracts.graphql';

const styles = () => ({
  contractValue: {
    flex: '1 100 auto',
  },
  nameValue: {
    flex: '1 1 auto',
    minWidth: 136,
  },
  authorValue: {
    flex: '1 10 auto',
  },
  authorAddressValue: {
    flex: '1 50 auto',
  },
  registeredAtValue: {
    flex: '1 50 auto',
  },
});

type ExternalProps = {|
  contracts: any,
  className?: string,
|};
type InternalProps = {|
  contracts: ContractTable_contracts,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractTable({
  contracts,
  className,
  classes,
}: Props): React.Element<*> {
  const contractValues = [];
  const nameValues = [];
  const authorValues = [];
  const registeredAt = [];
  contracts.forEach((contract) => {
    contractValues.push(<ContractLink contractHash={getID(contract.id)} />);
    nameValues.push(contract.name);
    authorValues.push(contract.author);
    registeredAt.push(
      <TransactionTimeLink
        transactionHash={contract.transaction_hash}
        blockTime={contract.block_time}
      />,
    );
  });
  const columns = [
    {
      name: 'Contract',
      values: contractValues,
      className: classes.contractValue,
    },
    {
      name: 'Name',
      values: nameValues,
      className: classes.nameValue,
      minWidth: true,
    },
    {
      name: 'Author',
      values: authorValues,
      className: classes.authorValue,
      visibleAt: 'xs',
    },
    {
      name: 'Registered',
      values: registeredAt,
      visibleAt: 'sm',
      className: classes.registeredAtValue,
    },
  ];
  return <Table className={className} columns={columns} />;
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    contracts: graphql`
      fragment ContractTable_contracts on Contract @relay(plural: true) {
        id
        name
        author
        transaction_hash
        block_time
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(ContractTable): React.ComponentType<ExternalProps>);
