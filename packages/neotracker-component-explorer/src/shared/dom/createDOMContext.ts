import { Example, Proxy, ReactElement } from '../../types';
import { createContext } from '../context';
import { PropsProxy } from '../proxies';
import { createDOMRenderer } from './createDOMRenderer';

// tslint:disable-next-line no-any
export interface CreateDOMContextOptions<E extends ReactElement> {
  readonly example: Example<E>;
  readonly container: Element;
  readonly proxies?: ReadonlyArray<Proxy>;
}
// tslint:disable-next-line no-any
export function createDOMContext<E extends ReactElement>({
  example,
  container,
  proxies = [],
}: CreateDOMContextOptions<E>) {
  return createContext({
    renderer: createDOMRenderer(container),
    example,
    proxies: [...proxies, PropsProxy],
    rendererOptions: {},
  });
}
