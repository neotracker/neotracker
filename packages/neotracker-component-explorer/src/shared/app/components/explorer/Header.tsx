import React from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { ContentWrapper } from './ContentWrapper';
import { Logo } from './Logo';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  background-color: white;
  z-index: 9999;
`;

const Layout = styled.div`
  display: grid;
  align-items: center;
  grid-gap: 40px;
  width: 100%;
  grid-template: 'logo .' 60px / auto 1fr;
`;

const LogoLink = styled(RouterLink)`
  display: grid;
  grid-gap: 10px;
  grid-auto-flow: column;
  align-items: center;
  text-decoration: none;
`;

export const Header = (props: CProps<typeof Wrapper>) => (
  <Wrapper {...props}>
    <ContentWrapper>
      <Layout>
        <LogoLink to="/">
          <Logo />
        </LogoLink>
      </Layout>
    </ContentWrapper>
  </Wrapper>
);
