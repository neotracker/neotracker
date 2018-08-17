import * as React from 'react';
import { AProps } from 'reakit';
import { PExample } from '../../../../types';
import { ContentWrapper } from './ContentWrapper';

// tslint:disable-next-line export-name
export const examples: [PExample<AProps<typeof ContentWrapper>>, PExample<AProps<typeof ContentWrapper>>] = [
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
];
