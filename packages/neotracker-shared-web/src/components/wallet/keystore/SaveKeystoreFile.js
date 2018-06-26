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

import { withStyles } from '../../../lib/base';

import SaveKeystoreFileBlob from './SaveKeystoreFileBlob';
import SaveKeystoreFileText from './SaveKeystoreFileText';

const styles = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
});

let isFileSaverSupported;
try {
  isFileSaverSupported = !!new Blob();
} catch (e) {
  // ignore errors
}

type ExternalProps = {|
  nep2: string,
  filename: string,
  onSave?: () => void,
  className?: string,
|};
type InternalProps = {|
  error: boolean,
  onError: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SaveKeystoreFile({
  nep2,
  filename,
  onSave,
  className,
  onError,
  error,
  classes,
}: Props): React.Element<any> {
  if (isFileSaverSupported) {
    if (error) {
      return (
        <div className={classNames(className, classes.root)}>
          <SaveKeystoreFileBlob
            nep2={nep2}
            filename={filename}
            onSave={onSave}
            onError={onError}
          />
          <SaveKeystoreFileText nep2={nep2} onSave={onSave} />
        </div>
      );
    }
    return (
      <SaveKeystoreFileBlob
        className={className}
        nep2={nep2}
        filename={filename}
        onSave={onSave}
        onError={onError}
      />
    );
  }

  return (
    <SaveKeystoreFileText className={className} nep2={nep2} onSave={onSave} />
  );
}

const enhance: HOC<*, *> = compose(
  pure,
  withState('state', 'setState', () => ({
    error: false,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onError: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        error: true,
      })),
  }),
  withStyles(styles),
);

export default (enhance(SaveKeystoreFile): React.ComponentType<ExternalProps>);
