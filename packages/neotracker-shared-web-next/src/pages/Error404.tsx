import * as React from 'react';

export function Error404() {
  return <div>404</div>;
}

export namespace Error404 {
  export const fetchDataForRoute = async (): Promise<void> => {
    await Promise.resolve();
  };
}
