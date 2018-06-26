/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure, withHandlers } from 'recompose';

import { type Theme } from '../../styles/createTheme';
import {
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Select,
  withStyles,
} from '../base';

const styles = (theme: Theme) => ({
  root: {
    flex: '1 1 auto',
    background: theme.palette.background.paper,
  },
  list: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  listItemTextRoot: {
    minWidth: 0,
    '& > h3': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'no-wrap',
    },
  },
  menuRoot: {
    maxWidth: '80%',
  },
});

const NULL_VALUE = '';

type Option = {
  id: string,
  text: string,
};

type ExternalProps = {|
  id: string,
  label?: ?string,
  selectText?: ?string,
  options: Array<Option>,
  selectedID: ?string,
  helperText?: string,
  onSelect: (option: ?Option) => void,
  className?: string,
  buttonClassName?: string,
|};
type InternalProps = {|
  onChange: (event: SyntheticEvent<>) => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Selector({
  id: idIn,
  label,
  selectText: selectTextIn,
  options,
  selectedID,
  helperText,
  className,
  onChange,
  classes,
}: Props): React.Element<*> {
  const id = `selector-${idIn}`;
  const selectText = selectTextIn || '';
  return (
    <FormControl className={classNames(className, classes.root)}>
      {label === undefined ? null : (
        <InputLabel htmlFor={id}>{label}</InputLabel>
      )}
      <Select
        value={selectedID == null ? NULL_VALUE : selectedID}
        renderValue={(value) => {
          const selectedOption = options.find((option) => option.id === value);
          return selectedOption == null ? selectText : selectedOption.text;
        }}
        onChange={onChange}
        input={<Input id={id} />}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.text}
          </MenuItem>
        ))}
      </Select>
      {helperText === undefined ? null : (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

const enhance: HOC<*, *> = compose(
  withHandlers({
    onChange: ({ onSelect, options }) => (event) =>
      onSelect(options.find((option) => option.id === event.target.value)),
  }),
  withStyles(styles),
  pure,
);

export default (enhance(Selector): React.ComponentType<ExternalProps>);
