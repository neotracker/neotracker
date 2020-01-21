import * as React from 'react';
import styled from 'styled-components';
import { createTestContext } from '../../shared/test/createTestContext';
import { PExample } from '../../types';

const Blockquote = styled.blockquote`
  /* nothing for now */
`;

interface BlockquoteProps {
  readonly children: React.ReactNode;
}

const defaultFixtureData = { oldFixtureData: 'old' };
const example: PExample<BlockquoteProps> = {
  component: Blockquote,
  // tslint:disable-next-line: no-any
  element: () => <Blockquote> TEST </Blockquote> as any,
  data: defaultFixtureData,
};

const { mount, getRootWrapper, setFixtureData } = createTestContext({ example });

describe('setFixtureData', () => {
  beforeEach(async () => {
    await mount();
  });

  test('setFixtureData replaces data field of example', () => {
    const newFixtureData = { newFixtureData: 'new' };

    const defaultProps = getRootWrapper().props();
    expect(defaultProps.data).toEqual(defaultFixtureData);

    setFixtureData(newFixtureData);
    const newProps = getRootWrapper().props();
    expect(newProps.data).toEqual(newFixtureData);
  });
});
