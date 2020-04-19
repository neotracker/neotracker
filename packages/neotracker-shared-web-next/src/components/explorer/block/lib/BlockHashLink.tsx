import * as React from 'react';
import { Link } from '../../../../lib/link';
import * as routes from '../../../../routes';

interface Props {
  readonly blockHash: string;
}

export const BlockHashLink = ({ blockHash }: Props) => (
  <Link variant="body1" path={routes.makeBlockHash(blockHash)} title={blockHash} />
);
