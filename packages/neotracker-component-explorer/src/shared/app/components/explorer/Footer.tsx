import React from 'react';
import { Flex, Paragraph, styled } from 'reakit';
import { ComponentProps } from '../../../../types';
import { ContentWrapper } from './ContentWrapper';

const year = new Date().getFullYear();

const Wrapper = styled(Flex)`
  justify-content: center;
  background-color: ${({ theme }) => theme.grayLightest};
  width: 100%;
  padding: 40px 0;
  color: ${({ theme }) => theme.gray};

  ${/* sc-sel */ Paragraph} {
    margin: 0;
    line-height: 1.5;
  }
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
