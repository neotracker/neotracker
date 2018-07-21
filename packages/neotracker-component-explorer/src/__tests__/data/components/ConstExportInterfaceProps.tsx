import * as React from 'react';

interface FooProps {
  readonly foo: string;
}

export const ConstExportInterfaceProps = ({ foo }: FooProps) => <div>{foo}</div>;
