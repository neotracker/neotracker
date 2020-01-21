import React from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { assertNever } from '../../../utils';
import { findNonEmptySiblingSection, findSectionByLocation, getSectionContent, getSectionURL } from '../../utils';
import { WithCodeRevision, WithRenderConfig } from '../render';
import { Markdown } from './Markdown';
import { Playground } from './Playground';
import { PropsTable } from './PropsTable';
import { RenderAPITable } from './RenderAPITable';
import { SectionUses } from './SectionUses';

const Name = styled.h1`
  margin-right: auto;
`;

const Wrapper = styled.div`
  @media (max-width: 768px) {
    margin-left: -8px;
    margin-right: -8px;
    max-width: 100vw;
  }
`;

const Content = styled.div`
  border-top: 1px solid ${({ theme }) => theme.grayLightest};
  margin-top: 1em;
  padding-top: 1em;
`;

const PathLink = styled.a`
  font-family: monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.grayLight};
`;

// tslint:disable-next-line no-any
export const Section = ({ location, ...props }: RouteComponentProps<any> & CProps<typeof Wrapper>) => (
  <WithCodeRevision>
    {(codeRevision) => (
      <WithRenderConfig>
        {({ sections }) => {
          const section = findSectionByLocation(sections, location);
          if (section === undefined) {
            return <Redirect to="/" />;
          }

          const pathLink =
            // tslint:disable-next-line no-null-keyword
            section.filePath === undefined || section.absoluteFilePath === undefined ? null : (
              <PathLink href={`vscode://file${section.absoluteFilePath}`}>{section.filePath}</PathLink>
            );

          const sectionContent = getSectionContent(section);
          if (section.type === 'component' || sectionContent.length > 0) {
            return (
              <Wrapper {...props}>
                <Helmet>
                  <title>{section.name}</title>
                </Helmet>
                <Name>{section.name}</Name>
                {pathLink}
                <SectionUses section={section} />
                <SectionUses usedBy section={section} />
                <Content>
                  {sectionContent.map((content, i) => {
                    const key = `${codeRevision}/${section.name}${i}`;
                    switch (content.type) {
                      case 'markdown':
                        return <Markdown text={content.content} key={key} />;
                      case 'code': {
                        if (section.type === 'component' && section.component.evalInContext !== undefined) {
                          return (
                            <Playground
                              code={content.code}
                              fixtureCode={content.fixtureCode}
                              exampleTemplate={content.exampleTemplate}
                              evalInContext={section.component.evalInContext}
                              key={key}
                            />
                          );
                        }

                        // tslint:disable-next-line no-null-keyword
                        return null;
                      }
                      default:
                        assertNever(content);
                        throw new Error('Unknown content type');
                    }
                  })}
                </Content>
                <RenderAPITable section={section} />
                <PropsTable section={section} />
              </Wrapper>
            );
          }

          const sibling = findNonEmptySiblingSection(sections, section.name);

          return <Redirect to={sibling === undefined ? '/' : getSectionURL(sections, sibling.name)} />;
        }}
      </WithRenderConfig>
    )}
  </WithCodeRevision>
);
