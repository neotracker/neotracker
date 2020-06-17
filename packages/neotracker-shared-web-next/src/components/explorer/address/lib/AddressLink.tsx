import * as React from 'react';
import styled from 'styled-components';
import { prop } from 'styled-tools';
import { Typography as MuiTypography } from '../../../../lib/base';
import { Link } from '../../../../lib/link';
import * as routes from '../../../../routes';

const Typography = styled(MuiTypography)<any>`
  color: ${prop('theme.palette.secondary.light')};
  font-weight: ${prop('theme.typography.fontWeightRegular')};
  text-decoration: 'none';
  overflow: 'hidden';
  text-overflow: 'ellipsis';
`;

interface Props {
  readonly addressHash: string;
  readonly highlighted?: boolean;
  readonly white?: boolean;
  readonly newTab?: boolean;
  readonly component?: string;
}

export const AddressLink = ({ addressHash, highlighted, white, newTab, component }: Props) => {
  if (highlighted) {
    return (
      <Typography variant="body1" component={component}>
        {addressHash}
      </Typography>
    );
  }
  const path = routes.makeAddress(addressHash);

  return <Link variant="body1" path={path} title={addressHash} white={white} newTab={newTab} component={component} />;
};
