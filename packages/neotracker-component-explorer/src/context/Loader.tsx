import * as React from 'react';
import { Proxy, ProxyChildrenProps, ReactElement } from '../types';
import { cloneElement } from '../utils';

export interface LoaderOptions<E extends ReactElement> extends ProxyChildrenProps<E> {
  readonly proxies: ReadonlyArray<Proxy>;
}
export function Loader<E extends ReactElement>({ proxies, ...firstProps }: LoaderOptions<E>) {
  if (proxies.length === 0) {
    const { fixture, props } = firstProps;

    return cloneElement(fixture.element, props);
  }

  function nextProxy(props: ProxyChildrenProps<E>, toIndex: number): ReactElement {
    const ProxyComponent = proxies[toIndex];

    return <ProxyComponent {...props}>{(nextProps) => nextProxy(nextProps, toIndex + 1)}</ProxyComponent>;
  }

  return nextProxy(firstProps, 0);
}
