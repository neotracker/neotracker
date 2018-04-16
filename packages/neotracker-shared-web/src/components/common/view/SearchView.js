/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Card } from '../../../lib/base';
import { CenteredView } from '../../../lib/layout';

import CommonHeader from './CommonHeader';

type ExternalProps = {|
  name: string,
  pluralName: string,
  content: React.Element<any>,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SearchView({
  name,
  pluralName,
  content,
  className,
}: Props): React.Element<*> {
  return (
    <CenteredView className={className}>
      <Card>
        <CommonHeader name={name} pluralName={pluralName} />
        {content}
      </Card>
    </CenteredView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(SearchView): React.ComponentType<ExternalProps>);
