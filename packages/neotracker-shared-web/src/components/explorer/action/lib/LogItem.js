/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import { graphql } from 'react-relay';

import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer } from '../../../../graphql/relay';

import ActionItem from './ActionItem';
import { type LogItem_action } from './__generated__/LogItem_action.graphql';

const styles = () => ({});

type ExternalProps = {|
  action: any,
  className?: string,
|};
type InternalProps = {|
  action: LogItem_action,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function LogItem({ className, action }: Props): React.Element<*> {
  return (
    <ActionItem className={className} action={action}>
      <Typography variant="body1">Log:&nbsp;</Typography>
      <Typography variant="body1">{action.message}</Typography>
    </ActionItem>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    action: graphql`
      fragment LogItem_action on Action {
        ...ActionItem_action
        message
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(LogItem): React.ComponentType<ExternalProps>);
