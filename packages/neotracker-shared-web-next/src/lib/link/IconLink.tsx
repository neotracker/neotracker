import * as React from 'react';
import { Link as RRLinkIn } from 'react-router-dom';
import styled from 'styled-components';
import { prop } from 'styled-tools';
import { Icon as MuiIcon } from '../base';

const Icon = styled(MuiIcon)`
  color: ${prop('theme.palette.text.seconday')};
  text-decoration: none;
  &:hover {
    color: ${prop('theme.palette.text.primary')};
  }
`;

const RRLink = styled(RRLinkIn)`
  color: ${prop('theme.palette.text.seconday')};
  text-decoration: none;
  &:hover {
    color: ${prop('theme.palette.text.primary')};
  }
`;

interface Props {
  readonly path: string;
  readonly icon: string;
}

export const IconLink = ({ path, icon }: Props) => (
  <RRLink to={path}>
    <Icon>{icon}</Icon>
  </RRLink>
);
