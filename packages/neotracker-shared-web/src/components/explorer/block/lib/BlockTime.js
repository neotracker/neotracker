/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { TimeAgo } from '../../../common/timeago';

import { withStyles } from '../../../../lib/base';

const styles = () => ({
  root: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

type ExternalProps = {|
  blockTime: ?number,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockTime({ blockTime, className, classes }: Props): React.Element<*> {
  return (
    <TimeAgo
      className={classNames(className, classes.root)}
      variant="body1"
      time={blockTime}
      nullString="Pending"
    />
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(BlockTime): React.ComponentType<ExternalProps>);
