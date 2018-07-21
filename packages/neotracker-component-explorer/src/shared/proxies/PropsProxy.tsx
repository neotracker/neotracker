import { ProxyProps, ReactElement } from '../../types';
import { cloneElement } from '../utils';

export function PropsProxy<E extends ReactElement>({ fixture, props }: ProxyProps<E>) {
  return cloneElement(fixture.element, props);
}
