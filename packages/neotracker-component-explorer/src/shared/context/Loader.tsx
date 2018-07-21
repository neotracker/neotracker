import * as React from 'react';
import { Proxy, ProxyChildrenProps, ReactElement } from '../../types';
import { cloneElement } from '../utils';

export interface LoaderOptions extends ProxyChildrenProps {
  readonly proxies: ReadonlyArray<Proxy>;
}
export function Loader({ proxies, ...firstProps }: LoaderOptions) {
  if (proxies.length === 0) {
    const { fixture, props } = firstProps;

    return cloneElement(fixture.element, props);
  }

  function nextProxy(props: ProxyChildrenProps, toIndex: number): ReactElement {
    const ProxyComponent = proxies[toIndex];

    return <ProxyComponent {...props}>{(nextProps) => nextProxy(nextProps, toIndex + 1)}</ProxyComponent>;
  }

  return nextProxy(firstProps, 0);
}
