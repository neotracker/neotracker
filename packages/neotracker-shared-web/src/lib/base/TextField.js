/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure, withHandlers } from 'recompose';

import Input from './Input';
import InputLabel from './InputLabel';
import FormControl from './FormControl';
import FormHelperText from './FormHelperText';

import { createKeyDown, createKeyUp } from './keys';
import withStyles from './withStyles';

const styles = () => ({
  root: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    width: '100%',
  },
  subtextArea: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  characterCounter: {
    flex: '0 0 auto',
  },
  inputLabelRoot: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
});

export type ExternalProps = {|
  id: string,
  value: string,
  autoComplete?: string,
  noTabIndex?: boolean,
  hasSubtext?: boolean,
  subtext?: ?string,
  error?: boolean,
  maxCharacters?: number,
  label?: string,
  required?: boolean,
  multiline?: boolean,
  rows?: number,
  rowsMax?: number,
  type?: string,
  disabled?: boolean,
  readOnly?: boolean,
  onFocus?: (event: Object) => void,
  onBlur?: (event: Object) => void,
  onChange?: (event: Object) => void,
  onUpArrow?: (event: Object) => void,
  onDownArrow?: (event: Object) => void,
  onShiftUpArrow?: (event: Object) => void,
  onShiftDownArrow?: (event: Object) => void,
  onEscape?: (event: Object) => void,
  onEscapeUp?: (event: Object) => void,
  onEnter?: (event: Object) => void,
  onBackspace?: (event: Object) => void,
  onClick?: (event: Object) => void,
  setInputRef?: (ref: any) => void,
  inputClasses?: Object,
  className?: string,
|};
type InternalProps = {|
  onKeyDown: (event: Object) => void,
  onKeyUp: (event: Object) => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TextField({
  id: idIn,
  value,
  autoComplete,
  subtext,
  hasSubtext,
  error,
  maxCharacters,
  label,
  required,
  multiline,
  rows,
  rowsMax,
  type,
  disabled,
  readOnly,
  inputClasses,
  className,
  noTabIndex = false,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
  onKeyUp,
  onClick,
  setInputRef,
  classes,
}: Props): React.Element<*> {
  const id = `textField-${idIn}`;
  const anyError =
    error || (maxCharacters != null && value.length > maxCharacters);
  let subtextElement = null;
  if (hasSubtext) {
    subtextElement = <FormHelperText>{subtext || ''}</FormHelperText>;
  }
  let characterCounter = null;
  if (maxCharacters != null) {
    characterCounter = (
      <FormHelperText className={classes.characterCounter}>
        {value.length} / {maxCharacters}
      </FormHelperText>
    );
    if (subtextElement == null) {
      subtextElement = <div />;
    }
  }

  let subtextArea = null;
  if (subtextElement != null || characterCounter != null) {
    subtextArea = (
      <div className={classes.subtextArea}>
        {subtextElement}
        {characterCounter}
      </div>
    );
  }

  return (
    <FormControl
      className={classNames(className, classes.root)}
      error={anyError}
      required={!!required}
    >
      {label == null ? null : (
        <InputLabel htmlFor={id} classes={{ root: classes.inputLabelRoot }}>
          {label}
        </InputLabel>
      )}
      <Input
        id={id}
        classes={inputClasses}
        value={value}
        autoComplete={autoComplete}
        inputRef={setInputRef}
        disabled={disabled}
        type={type}
        multiline={!!multiline}
        rows={rows}
        rowsMax={rowsMax}
        inputProps={{
          onKeyDown,
          onKeyUp,
          onClick,
          readOnly: readOnly ? 'readonly' : undefined,
          tabIndex: noTabIndex ? -1 : undefined,
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
      />
      {subtextArea}
    </FormControl>
  );
}

const enhance: HOC<*, *> = compose(
  withHandlers({
    onKeyDown: createKeyDown,
    onKeyUp: createKeyUp,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(TextField): React.ComponentType<ExternalProps>);
