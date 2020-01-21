import * as React from 'react';
import { Example, FixtureData, Proxy, ReactElement, Renderer, Wrapper } from '../../types';
import { Loader } from './Loader';

export interface CreateContextOptions<E extends ReactElement, W extends Wrapper, RendererOptions> {
  readonly renderer: Renderer<W, RendererOptions>;
  readonly example: Example<E>;
  readonly proxies?: ReadonlyArray<Proxy>;
  readonly onUpdateFixtureData?: (data: FixtureData) => void;
  readonly rendererOptions?: RendererOptions;
}

export interface Context<E extends ReactElement, W extends Wrapper> {
  readonly mount: () => Promise<void>;
  readonly unmount: () => void;
  readonly getRef: () => React.RefObject<E>;
  // tslint:disable-next-line no-any
  readonly getFixtureField: (key: string) => any;
  readonly getWrapper: () => W;
}

export function createContext<E extends ReactElement, W extends Wrapper, RendererOptions>({
  example,
  proxies = [],
  onUpdateFixtureData,
  renderer,
  rendererOptions,
}: CreateContextOptions<E, W, RendererOptions>): Context<E, W> {
  let ref: React.RefObject<E> | undefined;
  const getRef = (): React.RefObject<E> => {
    if (ref === undefined) {
      throw new Error('Component ref is not available yet. Did you call mount()?');
    }

    return ref;
  };

  let wrapper: W | undefined;
  const getWrapper = (): W => {
    if (wrapper === undefined) {
      throw new Error('Context wrapper has not been created yet. Did you call mount()?');
    }

    return wrapper;
  };

  let fixtureData: FixtureData = {};
  const updateFixtureData = (data: FixtureData) => {
    fixtureData = { ...fixtureData, ...data };

    if (onUpdateFixtureData !== undefined) {
      onUpdateFixtureData(fixtureData);
    }
  };

  // tslint:disable-next-line no-any
  const getFixtureField = (field: string): any => fixtureData[field];

  const unmount = () => {
    if (wrapper !== undefined) {
      wrapper.unmount();
      wrapper = undefined;
    }
  };

  const mount = async () => {
    await new Promise<void>((resolve) => {
      unmount();
      fixtureData = example.data === undefined ? {} : example.data;

      ref = React.createRef<E>();
      wrapper = renderer(
        <Loader
          proxies={proxies}
          element={example.element(ref)}
          data={fixtureData}
          onUpdateFixtureData={updateFixtureData}
        />,
        rendererOptions,
      );
      resolve();
    });
  };

  return {
    getRef,
    getWrapper,
    getFixtureField,
    mount,
    unmount,
  };
}
