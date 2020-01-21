// tslint:disable no-any
import { Container } from 'constate';
import React from 'react';
import { SectionConfig } from '../../../../types';
import { filterSections } from '../../utils';

interface State {
  readonly filtered: ReadonlyArray<SectionConfig>;
}

// tslint:disable no-unnecessary-type-annotation
export const MenuContainer = ({
  sections,
  children,
}: {
  readonly sections: ReadonlyArray<SectionConfig>;
  readonly children: (props: State & { readonly filter: (input: string) => void }) => React.ReactNode;
}) => (
  <Container
    initialState={{ filtered: sections }}
    actions={
      {
        filter: (input: string) => () => ({
          filtered: input ? filterSections(sections, input) : undefined,
        }),
      } as any
    }
    children={children as any}
  />
);
