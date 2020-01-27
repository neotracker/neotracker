import { createTestContext } from '@neotracker/component-explorer';
import { interval, of as _of } from 'rxjs';
import { map } from 'rxjs/operators';
import { examples } from '../../../../components/render/FromStream.example';

const { mount, getWrapper, setProps, getRef } = createTestContext({ example: examples[0] });

describe('FromStream', () => {
  beforeEach(async () => {
    await mount();
  });

  test('renders stream of props', () => {
    expect(parseInt(getWrapper().text(), 10)).toEqual(0);
  });

  test('subscribes to new props stream', async () => {
    setProps({ props$: interval(1).pipe(map((value) => value * -1)) });
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
    expect(parseInt(getWrapper().text(), 10)).toBeLessThanOrEqual(1);
  });

  test('returns null on no value', () => {
    setProps({ props$: _of() });
    expect(getWrapper().isEmptyRender()).toBeTruthy();
  });

  test('access ref', () => {
    const ref = getRef();
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeDefined();
  });
});
