import { Container } from 'constate';
import * as React from 'react';

// tslint:disable-next-line strict-type-predicates
const getWindow = () => (typeof window === 'undefined' ? { innerHeight: 1024, innerWidth: 1024 } : window);

const getDimensions = (element: { readonly innerWidth: number; readonly innerHeight: number }) => ({
  width: element.innerWidth,
  height: element.innerHeight,
});

interface WithViewportState {
  readonly width: number;
  readonly height: number;
  readonly handler?: () => void;
}

function onMount({ setState }: { readonly setState: (state: Partial<WithViewportState>) => void }) {
  const handler = () => setState(getDimensions(getWindow()));
  // tslint:disable-next-line strict-type-predicates
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handler);
  }
  setState({ handler });
}

function onUnmount({ state }: { readonly state: WithViewportState }) {
  // tslint:disable-next-line strict-type-predicates
  if (typeof window !== 'undefined' && state.handler !== undefined) {
    window.removeEventListener('resize', state.handler);
  }
}

export const WithViewport = ({ children }: { readonly children: (state: WithViewportState) => React.ReactNode }) => (
  <Container initialState={getDimensions(getWindow())} onMount={onMount} onUnmount={onUnmount} children={children} />
);
