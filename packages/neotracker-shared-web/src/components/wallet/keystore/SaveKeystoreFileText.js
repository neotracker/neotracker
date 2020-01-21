/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { CopyField } from '../common';
import { Typography } from '../../../lib/base';

type ExternalProps = {|
  nep2: string,
  onSave?: () => void,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SaveKeystoreFileText({
  nep2,
  onSave,
  className,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      <Typography variant="body1">Save Encrypted Key:</Typography>
      <CopyField
        id="skft-keystore"
        value={nep2}
        name="Keystore"
        onClick={onSave}
      />
    </div>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(
  SaveKeystoreFileText,
): React.ComponentType<ExternalProps>);
