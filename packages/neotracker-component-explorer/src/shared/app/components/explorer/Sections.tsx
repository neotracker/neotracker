import React from 'react';
import { Redirect, Route, RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { flattenSections, getSectionURL, hasContent } from '../../utils';
import { CoreLayout } from '../layouts';
import { WithRenderConfig } from '../render';
import { ContentWrapper } from './ContentWrapper';
import { Menu } from './Menu';
import { Section } from './Section';

const getSlug = (pathname: string) => pathname.split('/')[1];

const Content = styled(ContentWrapper)`
  display: grid;
  grid-template-columns: 1fr 200px;
  grid-gap: 32px;
  margin-top: 40px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StyledMenu = styled(Menu)`
  position: sticky;
  top: 100px;
  overflow: auto;
  padding-right: 16px;
  max-height: calc(100vh - 136px);

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Sections = ({ location, match }: RouteComponentProps) => (
  <WithRenderConfig>
    {({ sections }) => {
      const section = sections.find((s) => s.slug === getSlug(location.pathname));
      if (section === undefined) {
        const sectionWithContent = flattenSections(sections).find(hasContent);
        if (sectionWithContent === undefined) {
          // tslint:disable-next-line
          // TODO: Better default
          return <div>No sections</div>;
        }

        return <Redirect to={getSectionURL(sections, sectionWithContent.name)} />;
      }

      return (
        <CoreLayout>
          <Content>
            <Route path={match.url} component={Section} />
            <StyledMenu sections={sections} showFilter={true} />
          </Content>
        </CoreLayout>
      );
    }}
  </WithRenderConfig>
);
