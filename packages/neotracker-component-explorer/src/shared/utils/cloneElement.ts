import * as React from 'react';
import { Props, ReactElement } from '../../types';

export function cloneElement<E extends ReactElement>(element: E, props?: Partial<Props<E>>): E {
  if (props === undefined) {
    return React.cloneElement(element) as E;
  }

  const newElement =
    props.children === undefined
      ? React.cloneElement(element, props)
      : React.cloneElement(element, props, props.children);

  return newElement as E;
}
