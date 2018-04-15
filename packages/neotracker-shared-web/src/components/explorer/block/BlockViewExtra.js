/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../../../styles/createTheme';
import { ExpandoCard } from '../../common/card';
import { Script } from '../script';

import { fragmentContainer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type BlockViewExtra_block } from './__generated__/BlockViewExtra_block.graphql';
import BlockTransactionPagingView from './BlockTransactionPagingView';

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
  block: any,
  className?: string,
|};
type InternalProps = {|
  block: BlockViewExtra_block,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockViewExtra({
  block,
  className,
  classes,
}: Props): React.Element<*> {
  const transactions = (
    <ExpandoCard
      title="Transactions"
      content={<BlockTransactionPagingView block={block} />}
    />
  );

  const invocation = (
    <ExpandoCard
      title="Invocation Script"
      content={
        <Script
          className={classes.padding}
          script={block.script.invocation_script}
        />
      }
    />
  );

  const verification = (
    <ExpandoCard
      title="Verification Script"
      content={
        <Script
          className={classes.padding}
          script={block.script.verification_script}
        />
      }
    />
  );

  return (
    <div className={classNames(className, classes.root)}>
      {transactions}
      {invocation}
      {verification}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    block: graphql`
      fragment BlockViewExtra_block on Block {
        ...BlockTransactionPagingView_block
        script {
          invocation_script
          verification_script
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(BlockViewExtra): React.ComponentType<ExternalProps>);
