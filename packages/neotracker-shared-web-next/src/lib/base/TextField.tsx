import React from 'react';
import styled from 'styled-components';
import { FormControl as MuiFormControl } from './FormControl';
import { FormHelperText as MuiFormHelperText } from './FormHelperText';
import { Input } from './Input';
import { InputLabel as MuiInputLabel } from './InputLabel';
import { createKeyDown, createKeyUp } from './keys';

const FormHelperText = styled(MuiFormHelperText)`
  flex: 0 0 auto;
`;

const FormControl = styled(MuiFormControl)`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
`;

const SubTextArea = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const InputLabel = styled(MuiInputLabel)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

interface Props {
  readonly id: string;
  readonly value: string;
  readonly autoComplete?: string;
  readonly noTabIndex?: boolean;
  readonly hasSubtext?: boolean;
  readonly subtext?: string | undefined;
  readonly error?: boolean;
  readonly maxCharacters?: number;
  readonly label?: string;
  readonly required?: boolean;
  readonly multiline?: boolean;
  readonly rows?: number;
  readonly rowsMax?: number;
  readonly type?: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onUpArrow?: (event: any) => void;
  readonly onDownArrow?: (event: any) => void;
  readonly onShiftUpArrow?: (event: any) => void;
  readonly onShiftDownArrow?: (event: any) => void;
  readonly onEscape?: (event: any) => void;
  readonly onEscapeUp?: (event: any) => void;
  readonly onEnter?: (event: any) => void;
  readonly onBackspace?: (event: any) => void;
  readonly onClick?: (event: any) => void;
  readonly setInputRef?: (ref: any) => void;
  readonly inputClasses?: any;
  readonly onKeyDown: (event: any) => void;
  readonly onKeyUp: (event: any) => void;
}

export const TextField = ({
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
  noTabIndex = false,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
  onKeyUp,
  onClick,
  setInputRef,
}: Props) => {
  const id = `textField-${idIn}`;
  const anyError = error || (maxCharacters !== undefined && value.length > maxCharacters);
  let subtextElement;
  if (hasSubtext) {
    subtextElement = <FormHelperText>{subtext || ''}</FormHelperText>;
  }
  let characterCounter;
  if (maxCharacters !== undefined) {
    characterCounter = (
      <FormHelperText>
        {value.length} / {maxCharacters}
      </FormHelperText>
    );
    if (subtextElement === undefined) {
      subtextElement = <div />;
    }
  }

  let subtextArea;
  if (subtextElement !== undefined || characterCounter !== undefined) {
    subtextArea = (
      <SubTextArea>
        {subtextElement}
        {characterCounter}
      </SubTextArea>
    );
  }

  return (
    <FormControl error={anyError} required={!!required}>
      {label === undefined ? undefined : <InputLabel htmlFor={id}>{label}</InputLabel>}
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
};
