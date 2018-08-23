import * as React from 'react';
import { Blockquote } from 'reakit';
import { createTestContext } from '../../shared/test/createTestContext';
import { PExample } from '../../types';

interface BlockquoteProps {
  readonly children: React.ReactNode;
}

const defaultFixtureData = { oldFixtureData: 'old' };
const example: PExample<BlockquoteProps> = {
  component: Blockquote,
  element: () => <Blockquote> TEST </Blockquote>,
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
