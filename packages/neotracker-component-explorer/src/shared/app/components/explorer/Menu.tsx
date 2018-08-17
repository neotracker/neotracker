import React from 'react';
import { NavLink } from 'react-router-dom';
import { AProps, Base, Grid, Input, Link, List } from 'reakit';
import { SectionConfig } from '../../../../types';
import { styled } from '../../theme';
import { MenuContainer } from './MenuContainer';

const Wrapper = styled(Grid)`
  grid-gap: 16px;
`;

const ListItem = Base.as('li');

const MenuList = styled(List)<{ readonly alwaysVisible: boolean }>`
  ${List} {
    ${({ alwaysVisible }) => (alwaysVisible ? 'display: block !important' : '')};
  }

  ${ListItem} {
    margin: 0;
  }
`;

const SectionLink = styled(Link)<{}>`
  display: block;
  line-height: 1.75;
  font-weight: 400;
  margin: 0;
  font-size: 1em;
  color: ${({ theme }) => theme.black};
  border-left: 3px solid transparent;
  padding-left: 10px;

  &:hover {
    border-color: ${({ theme }) => theme.pinkLight};
    text-decoration: none;
  }

  &.active {
    font-weight: 600;
    border-color: ${({ theme }) => theme.pinkDark};

    & + ${MenuList} {
      display: block;
    }
  }

  & + ${MenuList} {
    display: none;
  }

  & + ${MenuList} & {
    padding-left: 30px;
  }
`;

const renderList = (sections: ReadonlyArray<SectionConfig>, prevSlug = '') => {
  if (!sections.length) {
    // tslint:disable-next-line no-null-keyword
    return null;
  }

  const alwaysVisible = prevSlug === '' && sections.length <= 5;

  return (
    <MenuList alwaysVisible={alwaysVisible}>
      {sections.map((s) => (
        <ListItem key={s.slug}>
          <SectionLink as={NavLink} to={`${prevSlug}/${s.slug}`}>
            {s.name}
          </SectionLink>
          {renderList(s.sections, `${prevSlug}/${s.slug}`)}
        </ListItem>
      ))}
    </MenuList>
  );
};

type Props = AProps<typeof Wrapper> & {
  readonly sections: ReadonlyArray<SectionConfig>;
  readonly showFilter?: boolean;
};
export const Menu = ({ sections, showFilter, ...props }: Props) => (
  <Wrapper {...props}>
    {showFilter ? (
      <MenuContainer sections={sections}>
        {({ filter, filtered }) => (
          <>
            <Input
              placeholder="Filter..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => filter(e.target.value)}
            />
            {renderList(filtered)}
          </>
        )}
      </MenuContainer>
    ) : (
      renderList(sections)
    )}
  </Wrapper>
);
