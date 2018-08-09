import { createTestContext } from '@neotracker/component-explorer';
import { examples } from '../../../../components/render/Query.example';

const { mount, getWrapper, getRef } = createTestContext({ example: examples[0] });

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
});
