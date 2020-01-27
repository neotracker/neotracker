/* @flow */
import * as React from 'react';

import { pure } from 'recompose';

import { SvgIcon } from '../../../lib/base';

type Props = any;

export default (paths: Array<React.Element<*>>) => {
  function Icon(props: Props): React.Element<*> {
    return (
      <SvgIcon {...props} viewBox="0 0 24 24">
        {paths}
      </SvgIcon>
    );
  }

  return pure<*>(Icon);
};
