import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { SectionConfig } from '../../../../types';
import { findSectionUses, getSectionURL } from '../../utils';
import { WithRenderConfig } from '../render';
import { SectionContentWrapper } from './SectionContentWrapper';

const Wrapper = styled(SectionContentWrapper)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 5px;
  justify-content: start;
  white-space: nowrap;
`;

const Sections = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 5px;

  & > *:not(:last-child)::after {
    content: ', ';
  }
`;

interface Props {
  readonly section: SectionConfig;
  readonly usedBy?: boolean;
}

export const SectionUses = ({ usedBy, section, ...props }: Props) => {
  const label = usedBy ? 'Used by' : 'Uses';
  const prop = usedBy ? 'usedBy' : 'uses';

  return (
    <WithRenderConfig>
      {({ sections }) => {
        const uses = findSectionUses(sections, section, prop);
        if (uses.length === 0) {
          // tslint:disable-next-line no-null-keyword
          return null;
        }

        return (
          <Wrapper {...props}>
            {label}
            <Sections>
              {uses.map((s) => (
                <li key={s.name}>
                  <RouterLink to={getSectionURL(sections, s.name)}>{s.name}</RouterLink>
                </li>
              ))}
            </Sections>
          </Wrapper>
        );
      }}
    </WithRenderConfig>
  );
};
