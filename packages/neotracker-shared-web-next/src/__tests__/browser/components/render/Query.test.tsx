import { createTestContext } from '@neotracker/component-explorer';
import { examples } from '../../../../components/render/Query.example';

const { mount, getWrapper, setFixtureData, getRef } = createTestContext({ example: examples[0] });

describe('Query', () => {
  beforeEach(async () => {
    await mount();
  });

  test('renders', async () => {
    expect(getWrapper().text()).toEqual('f63jpjfmauhqqlcqfbndm9oju62brw866hk73iv5');
  });

  test('access ref', () => {
    const ref = getRef();
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeDefined();
  });

  test('change fixture data', async () => {
    const hash = 'block-hash';
    const newFixtureData = {
      appContext: {
        apollo: {
          Block: () => ({
            hash,
            id: 'id',
            transactions: {
              edges: [{ node: { hash: 'transaction-hash' } }],
              _typename: 'BlockToTransactionsConnection',
            },
            _typename: 'Block',
          }),
        },
      },
    };
    setFixtureData(newFixtureData);
    await new Promise<void>((resolve) => setTimeout(resolve, 5));

    expect(
      getWrapper()
        .text()
        .substr(0, 10),
    ).toEqual('block-hash');
  });
});
