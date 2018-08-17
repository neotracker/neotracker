import { ProxyProps, ReactElement } from '../../types';
import { cloneElement } from '../utils';

export function PropsProxy<E extends ReactElement>({ element, props }: ProxyProps<E>) {
  return cloneElement(element, props);
}
