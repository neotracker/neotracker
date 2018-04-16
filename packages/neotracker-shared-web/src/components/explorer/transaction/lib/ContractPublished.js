/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import { graphql } from 'react-relay';

import { ContractNameLink } from '../../contract/lib';
import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer } from '../../../../graphql/relay';

import { type ContractPublished_contract } from './__generated__/ContractPublished_contract.graphql';

const styles = () => ({
  output: {
    alignItems: 'center',
    display: 'flex',
    minWidth: '0',
  },
});

type ExternalProps = {|
  contract: any,
  className?: string,
|};
type InternalProps = {|
  contract: ContractPublished_contract,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractPublished({
  contract,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.output)}>
      <Typography variant="body1">Published&nbsp;</Typography>
      <ContractNameLink contract={contract} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    contract: graphql`
      fragment ContractPublished_contract on Contract {
        ...ContractNameLink_contract
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(ContractPublished): React.ComponentType<ExternalProps>);
