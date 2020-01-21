/* @flow */
import * as React from 'react';
import type { TypographyProps } from '@material-ui/core/Typography';

import { type HOC, compose, pure } from 'recompose';
import { connect } from 'react-redux';

import { Typography } from '../../../lib/base';

import { formatTime } from '../../../utils';
import { selectTimerState } from '../../../redux';

type ExternalProps = {
  ...TypographyProps,
  time: ?number,
  nullString?: string,
  prefix?: string,
};
type InternalProps = {||};
type Props = {
  ...ExternalProps,
  ...InternalProps,
  state: ?any,
  dispatch: ?any,
};
function TimeAgo({
  time,
  nullString,
  state,
  dispatch,
  prefix,
  ...otherProps
}: Props): React.Element<*> {
  let value;
  if (time == null) {
    value = nullString;
  } else {
    value = formatTime(time);
  }

  if (prefix != null) {
    value = `${prefix}${value || ''}`;
  }

  return <Typography {...(otherProps: $FlowFixMe)}>{value}</Typography>;
}

const enhance: HOC<*, *> = compose(
  connect((state) => ({ state: selectTimerState(state) })),
  pure,
);

export default (enhance(TimeAgo): React.ComponentType<ExternalProps>);
