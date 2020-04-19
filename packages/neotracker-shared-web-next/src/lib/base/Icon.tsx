// tslint:disable-next-line: match-default-export-name
import MUIIcon, { IconProps } from '@material-ui/core/Icon';
import React from 'react';
import styled from 'styled-components';

const InnerIcon = styled(MUIIcon)`
  min-width: 1em;
`;

interface Props extends IconProps {
  // tslint:disable-next-line: no-any
  readonly children?: any;
}

export const Icon = ({ children, ...other }: Props) => (
  <InnerIcon color={other.color} fontSize={other.fontSize}>
    {children}
  </InnerIcon>
);
