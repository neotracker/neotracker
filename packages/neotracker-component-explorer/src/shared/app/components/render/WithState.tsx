import React from 'react';
import { Container, ContainerChildren, StateWithSetState } from 'reakit';

function setState<State>(state: Partial<State>) {
  return (props: StateWithSetState<State>) => {
    props.setState(state);
  };
}

export function WithState<State>({
  initialState,
  children,
}: {
  readonly initialState: State;
  readonly children?: ContainerChildren<
    State,
    {},
    { readonly setState: (state: Partial<State>) => (props: StateWithSetState<State>) => void }
  >;
}) {
  return <Container effects={{ setState }} initialState={initialState} children={children} />;
}
