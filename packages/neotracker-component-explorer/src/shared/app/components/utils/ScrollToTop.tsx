import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { WithRouter } from '../render';

interface Props {
  // tslint:disable-next-line no-any
  readonly location: RouteComponentProps<any, any>['location'];
  readonly children: React.ReactNode;
}
class ScrollToTopBase extends React.Component<Props> {
  public componentDidUpdate(prevProps: Props) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  public render() {
    return this.props.children;
  }
}

export const ScrollToTop = ({ children }: { readonly children: React.ReactNode }) => (
  <WithRouter>{({ location }) => <ScrollToTopBase location={location} children={children} />}</WithRouter>
);
