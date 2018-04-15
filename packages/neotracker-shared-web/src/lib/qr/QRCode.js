/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import qr from 'qr-image';

type ExternalProps = {|
  value: string,
  size: number,
  alt: string,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function QRCode({ value, size, alt, className }: Props): React.Element<*> {
  const buffer = qr.imageSync(value, { margin: 0 });
  const dataURI = `data:image/png;base64,${buffer.toString('base64')}`;
  return (
    <img
      alt={alt}
      className={className}
      src={dataURI}
      width={`${size}px`}
      height={`${size}px`}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(QRCode): React.ComponentType<ExternalProps>);
