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
import { withRouter } from 'react-router';

import { type Theme } from '../../../styles/createTheme';
import { Button, TextField, Typography, withStyles } from '../../../lib/base';

import * as routes from '../../../routes';

const styles = (theme: Theme) => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    flex: '1 1 auto',
  },
  textField: {
    display: 'flex',
    flex: '1 1 auto',
    marginRight: theme.spacing.unit,
  },
  button: {
    height: theme.spacing.unit * 5,
  },
  search: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  onSearch?: () => void,
  setInputRef?: (ref: any) => void,
  className?: string,
|};
type InternalProps = {|
  value: string,
  onChange: (event: Object) => void,
  onSearch: () => void,
  inputClasses?: Object,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SearchField({
  setInputRef,
  className,
  value,
  onChange,
  onSearch,
  inputClasses,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <TextField
        id="search-field"
        className={classes.textField}
        value={value}
        label="Search by block/tx/address hash or block index"
        onChange={onChange}
        onEnter={onSearch}
        inputClasses={inputClasses}
        setInputRef={setInputRef}
      />
      <Button
        className={classes.button}
        color="primary"
        variant="raised"
        onClick={onSearch}
      >
        <Typography className={classes.search} variant="body1">
          SEARCH
        </Typography>
      </Button>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withRouter,
  withState('state', 'setState', () => ({
    value: '',
  })),
  withProps(({ state }) => state),
  withHandlers({
    onSearch: ({ onSearch, value, history }) => () => {
      history.push(routes.makeSearch(value.trim()));
      if (onSearch != null) {
        onSearch();
      }
    },
    onChange: ({ setState }) => event => {
      const { value } = event.target;
      setState(prevState => ({
        ...prevState,
        value,
      }));
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(SearchField): React.ComponentType<ExternalProps>);
