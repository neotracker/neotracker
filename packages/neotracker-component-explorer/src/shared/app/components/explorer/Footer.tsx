import React from 'react';
import styled from 'styled-components';
import { ComponentProps } from '../../../../types';
import { ContentWrapper } from './ContentWrapper';

const year = new Date().getFullYear();

const Paragraph = styled.p`
  margin: 0;
  line-height: 1.5;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.grayLightest};
  width: 100%;
  padding: 40px 0;
  color: ${({ theme }) => theme.gray};
`;

export const Footer = (props: ComponentProps<typeof Wrapper>) => (
  <Wrapper {...props}>
    <ContentWrapper column>
      <Paragraph>
        Copyright © 2017-
        {year} NEO Tracker
      </Paragraph>
    </ContentWrapper>
  </Wrapper>
);
