import * as React from 'react';
import { Link } from '../../../../lib/link';
import * as routes from '../../../../routes';
import { formatNumber } from '../../../../utils';

interface Props {
  readonly blockIndex: number;
}

export const BlockIndexLink = ({ blockIndex }: Props) => (
  <Link variant="body1" path={routes.makeBlockIndex(blockIndex)} title={formatNumber(blockIndex)} />
);
