import * as React from 'react';

interface FooProps {
  readonly foo: string;
}

// tslint:disable-next-line no-default-export export-name
export default ({ foo }: FooProps) => <div>{foo}</div>;
