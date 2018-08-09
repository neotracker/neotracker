import { createTestContext } from '../../shared/test/createTestContext';
import { examples } from '../data/components/RefAccess.example';

const { mount, getRef } = createTestContext({ example: examples[0] });

describe('Query', () => {
  beforeEach(async () => {
    await mount();
  });

  test('access ref', () => {
    const ref = getRef();
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeDefined();
  });
});
