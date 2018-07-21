import * as React from 'react';

export class ClassExportInlineProps<T> extends React.Component<{ readonly foo: T }> {
  public render() {
    return <div>Hello World</div>;
  }
}
