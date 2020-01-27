/* @flow */
import * as React from 'react';

import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import { connect } from 'react-redux';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
// $FlowFixMe
import { labels, sanitizeError } from '@neotracker/shared-utils';

import type { AppContext } from '../../../AppContext';
import TextField, {
  type ExternalProps as TextFieldExternalProps,
} from '../../../lib/base/TextField';

import { clipboard } from '../../../utils';
import { setSnackbar } from '../../../redux';

type ExternalProps = {|
  ...TextFieldExternalProps,
  name: string,
  value: string,
|};
type InternalProps = {|
  appContext: AppContext,
  onClick: (event: SyntheticMouseEvent<>) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CopyField({
  onClick: onClickIn,
  appContext,
  name,
  ...props
}: Props): React.Element<*> {
  let onClick;
  if (clipboard.isSupported(appContext.userAgent)) {
    onClick = onClickIn;
  }
  return (
    // $FlowFixMe
    <TextField {...props} onClick={onClick} readOnly />
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  connect(
    null,
    (dispatch) => ({
      showSnackbar: ({ message }) => dispatch(setSnackbar({ message })),
      showSnackbarError: ({ error }) =>
        dispatch(setSnackbar({ message: sanitizeError(error).clientMessage })),
    }),
  ),
  withHandlers({
    onClick: ({
      value,
      name,
      onClick,
      appContext: appContextIn,
      showSnackbar,
      showSnackbarError,
    }) => (event) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      webLogger.info({
        title: 'browser_copy',
        [labels.CLICK_SOURCE]: name,
      });
      clipboard
        .copy(value, appContext.userAgent)
        .then(() => {
          showSnackbar({ message: `${name} Copied` });
        })
        .catch((error) => {
          showSnackbarError({ error });
        });
      if (onClick) {
        onClick(event);
      }
    },
  }),
  pure,
);

export default (enhance(CopyField): React.ComponentType<ExternalProps>);
