/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import { graphql } from 'react-relay';

import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer } from '../../../../graphql/relay';

import ActionItem from './ActionItem';
import { type NotificationItem_action } from './__generated__/NotificationItem_action.graphql';
import TransferItem from './TransferItem';

const styles = () => ({});

type ExternalProps = {|
  action: any,
  addressHash?: string,
  className?: string,
|};
type InternalProps = {|
  action: NotificationItem_action,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NotificationItem({
  action,
  addressHash,
  className,
}: Props): React.Element<*> {
  let item = [
    <Typography key={0} variant="body1">
      Notify:&nbsp;
    </Typography>,
    <Typography key={1} variant="body1">
      {action.message}
    </Typography>,
  ];
  if (action.transfer != null) {
    item = (
      <TransferItem transfer={action.transfer} addressHash={addressHash} />
    );
  }

  return (
    <ActionItem className={className} action={action}>
      {item}
    </ActionItem>
  );
}

const enhance: HOC<*, *> = (compose(
  fragmentContainer({
    action: graphql`
      fragment NotificationItem_action on Action {
        ...ActionItem_action
        message
        args_raw
        transfer {
          ...TransferItem_transfer
        }
      }
    `,
  }),
  withStyles(styles),
  pure,
): $FlowFixMe);

export default (enhance(NotificationItem): React.ComponentType<ExternalProps>);
