import { Container } from 'constate';
import React from 'react';

// tslint:disable-next-line strict-type-predicates
const getWindow = () => (typeof window === 'undefined' ? { scrollY: 0, scrollX: 0 } : window);

const getScrollPosition = (element: { readonly scrollY: number; readonly scrollX: number }) => ({
  y: element.scrollY,
  x: element.scrollX,
});

interface WithScrollState {
  readonly x: number;
  readonly y: number;
  readonly handler?: () => void;
}

function onMount({ setState }: { readonly setState: (state: Partial<WithScrollState>) => void }) {
  const handler = () => setState(getScrollPosition(getWindow()));
  // tslint:disable-next-line strict-type-predicates
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handler);
  }
  setState({ handler });
}

function onUnmount({ state }: { readonly state: WithScrollState }) {
  // tslint:disable-next-line strict-type-predicates
  if (typeof window !== 'undefined' && state.handler !== undefined) {
    window.removeEventListener('scroll', state.handler);
  }
}

export const WithScroll = ({ children }: { readonly children: (state: WithScrollState) => React.ReactNode }) => (
  <Container
    initialState={getScrollPosition(getWindow())}
    onMount={onMount}
    onUnmount={onUnmount}
    children={children}
  />
);
