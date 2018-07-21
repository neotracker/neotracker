import * as React from 'react';
import { Observable, Subscription } from 'rxjs';

interface Props<T> {
  /* Stream of props to render */
  readonly props$: Observable<T>;
  /* Render function */
  readonly children: (props: T) => React.ReactNode;
}
interface State<T> {
  readonly value?: T;
}
export class FromStream<T> extends React.Component<Props<T>, State<T>> {
  // tslint:disable-next-line readonly-keyword
  public state: State<T>;
  private mutableSubscription: Subscription | undefined;
  private mutableMounted = false;

  public constructor(props: Props<T>) {
    super(props);

    this.state = {};
    this.subscribe();
    this.mutableMounted = true;
  }

  public componentWillUnmount(): void {
    this.mutableMounted = false;
    this.unsubscribe();
  }

  public componentDidUpdate(prevProps: Props<T>): void {
    if (this.props.props$ !== prevProps.props$) {
      this.subscribe();
    }
  }

  public render(): React.ReactNode {
    const { value } = this.state;
    if (value === undefined) {
      // tslint:disable-next-line no-null-keyword
      return null;
    }

    if (process.env.BUILD_FLAG_IS_SERVER) {
      this.unsubscribe();
    }

    return this.props.children(value);
  }

  private subscribe(): void {
    this.unsubscribe();
    let stateSet = false;
    this.mutableSubscription = this.props.props$.subscribe({
      next: (value) => {
        stateSet = true;
        this._setValue(value);
      },
    });

    if (!stateSet) {
      this._setValue();
    }
  }

  private _setValue(value?: T): void {
    if (this.mutableMounted) {
      this.setState(() => ({ value }));
    } else {
      // tslint:disable-next-line no-object-mutation
      this.state = { value };
    }
  }

  private unsubscribe(): void {
    if (this.mutableSubscription !== undefined) {
      this.mutableSubscription.unsubscribe();
      this.mutableSubscription = undefined;
    }
  }
}
