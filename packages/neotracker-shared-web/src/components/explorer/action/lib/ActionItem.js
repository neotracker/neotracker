/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import { graphql } from 'react-relay';

import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer } from '../../../../graphql/relay';

import { type ActionItem_action } from './__generated__/ActionItem_action.graphql';

const styles = () => ({
  root: {
    alignItems: 'center',
    display: 'flex',
  },
});

type ExternalProps = {|
  action: any,
  className?: string,
  children?: any,
|};
type InternalProps = {|
  action: ActionItem_action,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ActionItem({
  action,
  className,
  children,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <Typography variant="body1">{`${action.index}. `}</Typography>
      {children}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    action: graphql`
      fragment ActionItem_action on Action {
        index
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(ActionItem): React.ComponentType<ExternalProps>);
