import React from 'react';
import styled from 'styled-components';
import { Footer, Header } from '../explorer';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  color: ${({ theme }) => theme.black};
  align-items: center;
  min-height: 100vh;
  width: 100%;
`;

const StyledHeader = styled(Header)`
  position: fixed;
  top: 0;
  left: 0;
  height: 60px;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.25);
`;

const Content = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  margin: 60px 0;
  width: 100%;
`;

const StyledFooter = styled(Footer)`
  margin-top: auto;
`;

export const CoreLayout = ({ children, ...props }: { readonly children: React.ReactNode }) => (
  <Wrapper {...props}>
    <StyledHeader />
    <Content>{children}</Content>
    <StyledFooter />
  </Wrapper>
);
