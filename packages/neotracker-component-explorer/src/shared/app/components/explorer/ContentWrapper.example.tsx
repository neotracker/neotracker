import * as React from 'react';
import { ComponentProps, PExample } from '../../../../types';
import { ContentWrapper } from './ContentWrapper';

// tslint:disable-next-line export-name
export const examples: readonly [
  PExample<ComponentProps<typeof ContentWrapper>>,
  PExample<ComponentProps<typeof ContentWrapper>>,
] = [
  {
    element: () => <ContentWrapper>Hello World</ContentWrapper>,
    data: {},
  },
  {
    element: () => {
      const goodnight = 'Goodnight Moon';

      return <ContentWrapper>{goodnight}</ContentWrapper>;
    },
  },
] as const;
