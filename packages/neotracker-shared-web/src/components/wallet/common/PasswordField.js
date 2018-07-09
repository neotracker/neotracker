/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withProps,
  withState,
} from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Icon, IconButton, withStyles } from '../../../lib/base';
import TextField, {
  type ExternalProps as TextFieldExternalProps,
} from '../../../lib/base/TextField';

import CopyField from './CopyField';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
  },
  visibleButtonSubtext: {
    marginTop: theme.spacing.unit,
  },
  visibleButtonLabelOnly: {
    marginTop: theme.spacing.unit / 2,
  },
});

type ExternalProps = {|
  ...TextFieldExternalProps,
  value: string,
  copyOnClickName?: string,
  autoComplete?: string,
  label?: string,
  validation?: string,
  hasSubtext?: boolean,
  onChange?: (event: Object) => void,
  onEnter?: () => void,
  className?: string,
|};
type InternalProps = {|
  visible: boolean,
  onHidePassword: () => void,
  onShowPassword: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PasswordField({
  value,
  label,
  autoComplete,
  validation: validationIn,
  hasSubtext: hasSubtextIn,
  copyOnClickName,
  onEnter,
  onChange,
  className,
  visible,
  onHidePassword,
  onShowPassword,
  classes,
  ...other
}: Props): React.Element<*> {
  const type = visible ? 'text' : 'password';
  const validation = value === '' ? null : validationIn;
  const hasSubtext = !!hasSubtextIn;
  let field = (
    // $FlowFixMe
    <TextField
      {...other}
      value={value}
      type={type}
      autoComplete={autoComplete}
      error={validation != null}
      subtext={validation}
      hasSubtext={hasSubtext}
      label={label}
      onChange={onChange}
      onEnter={onEnter}
    />
  );
  if (copyOnClickName != null && visible) {
    field = (
      // $FlowFixMe
      <CopyField
        {...other}
        value={value}
        type={type}
        autoComplete={autoComplete}
        error={validation != null}
        subtext={validation}
        hasSubtext={hasSubtext}
        label={label}
        onChange={onChange}
        onEnter={onEnter}
        name={copyOnClickName}
      />
    );
  }
  return (
    <div className={classNames(className, classes.root)}>
      {field}
      <IconButton
        className={classNames({
          [classes.visibleButtonSubtext]: hasSubtext,
          [classes.visibleButtonLabelOnly]: !hasSubtext && label != null,
        })}
        onClick={visible ? onHidePassword : onShowPassword}
      >
        <Icon>{visible ? 'visibility_off' : 'visibility'}</Icon>
      </IconButton>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withState('state', 'setState', () => ({
    visible: false,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onHidePassword: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        visible: false,
      })),
    onShowPassword: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        visible: true,
      })),
  }),
  withStyles(styles),
  pure,
);

export default (enhance(PasswordField): React.ComponentType<ExternalProps>);
