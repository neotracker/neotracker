import * as React from 'react';
import { Base } from 'reakit';

export function Error404() {
  return <Base>404</Base>;
}

export namespace Error404 {
  export const fetchDataForRoute = async (): Promise<void> => {
    // do nothing
  };
}
