import * as React from 'react';

// tslint:disable-next-line no-any
export type ReactElement = React.ReactElement<any>;
export type Props<E extends ReactElement> = E extends React.ReactElement<infer P> ? P : never;

// tslint:disable-next-line no-any
export interface Example<E extends ReactElement> {
  readonly element: (ref?: React.Ref<E>) => E;
}
// tslint:disable-next-line no-any
export type CExample<C extends React.Component<any, any>> = Example<React.CElement<C['props'], C>>;
// tslint:disable-next-line no-any
export type PExample<P> = Example<React.ReactElement<P>>;

export interface FixtureData {
  // tslint:disable-next-line no-any
  readonly [fixtureName: string]: any;
}
// tslint:disable-next-line no-any
export interface Fixture<E extends ReactElement = any> {
  readonly element: E;
  // tslint:disable-next-line
  readonly data?: FixtureData;
}

// tslint:disable-next-line no-any
export interface ProxyChildrenProps<E extends ReactElement = any> {
  readonly fixture: Fixture<E>;
  readonly props?: Partial<Props<E>>;
  readonly onUpdateFixtureData: (data: FixtureData) => void;
}
// tslint:disable-next-line no-any
export interface ProxyProps<E extends ReactElement = any> extends ProxyChildrenProps<E> {
  readonly children: (props: ProxyChildrenProps<E>) => React.ReactNode;
}
// tslint:disable-next-line no-any
export type Proxy<E extends ReactElement = any> = React.ComponentType<ProxyProps<E>>;

export interface Wrapper {
  readonly unmount: () => void;
}
export type Renderer<W extends Wrapper, Options> = (element: ReactElement, options?: Options) => W;
