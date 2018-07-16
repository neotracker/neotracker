import { mount as mountEnzyme, MountRendererProps } from 'enzyme';
import * as React from 'react';
import { getExplorerConfig } from '../config';
import { createContext } from '../context';
import { AutoMockPropsProxy } from '../proxies';
import { Example, Props, Proxy, ReactElement } from '../types';

// tslint:disable-next-line no-any
export interface CreateTestContextOptions<E extends React.ReactElement<any>> {
  readonly example: Example<E>;
  readonly proxies?: ReadonlyArray<Proxy>;
  readonly rendererOptions?: MountRendererProps;
}
// tslint:disable-next-line no-any
export function createTestContext<E extends ReactElement>({
  example,
  proxies,
  rendererOptions,
}: CreateTestContextOptions<E>) {
  const { getRef, getWrapper: getRootWrapperBase, getFixtureField, mount } = createContext({
    renderer: mountEnzyme,
    example,
    proxies: [...getProxies(proxies), AutoMockPropsProxy],
    rendererOptions,
  });

  const getRootWrapper = () => {
    const wrapper = getRootWrapperBase();
    wrapper.update();

    return wrapper;
  };

  const component = example.element();
  // Typescript gets confused here on which overload to pick
  const getWrapper = () =>
    typeof component.type === 'string' ? getRootWrapper().find(component.type) : getRootWrapper().find(component.type);

  let prevProps = {};
  const setProps = (newProps: Partial<Props<E>>): void => {
    // tslint:disable-next-line prefer-object-spread
    prevProps = Object.assign({}, prevProps, newProps);

    getRootWrapper().setProps({ props: prevProps });
  };

  return {
    getRef,
    getRootWrapper,
    getWrapper,
    getFixtureField,
    setProps,
    mount,
  };
}

const getProxies = (proxies?: ReadonlyArray<Proxy>): ReadonlyArray<Proxy> => {
  if (proxies !== undefined) {
    return proxies;
  }

  return getExplorerConfig().proxies;
};
