/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { ExpandoCard } from '../../common/card';
import { Script } from '../script';
import { TransactionSummary } from '../transaction/summary';

import { fragmentContainer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type ContractViewExtra_contract } from './__generated__/ContractViewExtra_contract.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    padding: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    padding: {
      padding: theme.spacing.unit * 2,
    },
  },
  padding: {},
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
});

type ExternalProps = {|
  contract: any,
  className?: string,
|};
type InternalProps = {|
  contract: ContractViewExtra_contract,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractViewExtra({
  contract,
  className,
  classes,
}: Props): React.Element<*> {
  const publishTransaction = (
    <ExpandoCard
      title="Publish Transaction"
      content={
        <TransactionSummary transaction={contract.transaction} alwaysExpand />
      }
    />
  );

  const script = (
    <ExpandoCard
      title="Script"
      content={<Script className={classes.padding} script={contract.script} />}
    />
  );

  return (
    <div className={classNames(className, classes.root)}>
      {publishTransaction}
      {script}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    contract: graphql`
      fragment ContractViewExtra_contract on Contract {
        script
        transaction {
          ...TransactionSummary_transaction
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(ContractViewExtra): React.ComponentType<ExternalProps>);
