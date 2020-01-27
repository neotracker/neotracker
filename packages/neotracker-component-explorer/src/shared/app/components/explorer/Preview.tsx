// @ts-ignore
import pretty from 'pretty';
import * as React from 'react';
import { interval, Subscription } from 'rxjs';
import styled from 'styled-components';
import { EvalInContext, Proxy } from '../../../../types';
import { createDOMContext } from '../../../dom';
import { compileComponent } from '../../utils';
import { Editor } from './Editor';

const FontSizeBlock = styled.div`
  font-size: 14;
`;

const PreviewWrapper = styled.div`
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.05);
`;

const getHTML = (markup: string) => pretty(markup.replace(/ class="[^"]+"/g, ''));

interface Props {
  readonly code: string;
  readonly fixtureCode: string;
  readonly exampleTemplate: string;
  readonly evalInContext: EvalInContext;
  readonly proxies: ReadonlyArray<Proxy>;
  readonly showHTML?: boolean;
}
interface State {
  readonly error?: string;
  readonly html?: string;
}
export class Preview extends React.Component<Props, State> {
  public readonly state: State = {
    error: undefined,
    html: undefined,
  };

  public readonly mountNode = React.createRef<HTMLDivElement>();
  private mutableSubscription: Subscription | undefined;
  private mutableUnmount: (() => void) | undefined;

  public componentDidMount() {
    this.executeCode();
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      this.state.error !== nextState.error ||
      this.props.code !== nextProps.code ||
      this.props.fixtureCode !== nextProps.fixtureCode ||
      this.state.html !== nextState.html ||
      this.props.showHTML !== nextProps.showHTML
    );
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.code !== prevProps.code || this.props.fixtureCode !== prevProps.fixtureCode) {
      this.executeCode();
    }
  }

  public componentWillUnmount() {
    this.unmountPreview();
  }

  public unmountPreview() {
    const unmount = this.mutableUnmount;
    if (unmount) {
      this.unsubscribe();
      unmount();
    }
  }

  public executeCode() {
    this.setState({ error: undefined });
    const { code, fixtureCode, evalInContext, exampleTemplate, proxies } = this.props;
    const container = this.mountNode.current;
    if (!code || !container) {
      return;
    }

    try {
      const example = compileComponent({ code, fixtureCode, evalInContext, exampleTemplate });
      const { mount, unmount } = createDOMContext({ example, container, proxies });

      window.requestAnimationFrame(() => {
        this.unmountPreview();
        this.mutableUnmount = unmount;
        mount().catch(this.handleError);
        this.subscribe();
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  public readonly handleError = (e: Error) => {
    this.unmountPreview();
    this.setState({ error: e.toString() });
    // tslint:disable-next-line no-console
    console.error(e); // eslint-disable-line no-console
  };

  public render() {
    const { error, html } = this.state;

    return (
      <React.Fragment>
        {error ? (
          <FontSizeBlock as="pre" color="red">
            {error}
          </FontSizeBlock>
        ) : (
          <>
            <PreviewWrapper>
              <div ref={this.mountNode} />
            </PreviewWrapper>
            {<Editor code={getHTML(html === undefined ? '' : html)} readOnly controlled mode="text/html" />}
          </>
        )}
      </React.Fragment>
    );
  }

  private subscribe() {
    this.unsubscribe();
    this.updateHTML();
    this.mutableSubscription = interval(100).subscribe({
      next: () => {
        this.updateHTML();
      },
    });
  }

  private updateHTML(): void {
    const { current } = this.mountNode;
    if (current) {
      this.setState({ html: current.innerHTML });
    }
  }

  private unsubscribe() {
    if (this.mutableSubscription !== undefined) {
      this.mutableSubscription.unsubscribe();
      this.mutableSubscription = undefined;
    }
  }
}
