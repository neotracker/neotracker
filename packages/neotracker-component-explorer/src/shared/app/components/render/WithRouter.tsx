import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface WithRouterProps<P> {
  readonly children: (props: RouteComponentProps<P>) => React.ReactNode;
}
interface Props<P> extends WithRouterProps<P>, RouteComponentProps<P> {
  readonly children: (props: RouteComponentProps<P>) => React.ReactNode;
}
class WithRouterComponent<P> extends React.Component<Props<P>> {
  public render(): React.ReactNode {
    const { children, ...props } = this.props;

    return children(props);
  }
}

export interface WithRouter<P> extends React.ComponentClass<WithRouterProps<P>> {}
export const WithRouter = withRouter(WithRouterComponent);
