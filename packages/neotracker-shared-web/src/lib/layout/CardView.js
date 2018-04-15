/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import CenteredView from './CenteredView';
import TitleCard from './TitleCard';

type ExternalProps = {|
  title: string,
  extra?: React.Element<any>,
  children?: any,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CardView({
  title,
  children,
  extra,
  className,
}: Props): React.Element<*> {
  return (
    <CenteredView className={className}>
      <TitleCard title={title}>{children}</TitleCard>
      {extra}
    </CenteredView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(CardView): React.ComponentType<ExternalProps>);
