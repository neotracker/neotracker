// tslint:disable no-import-side-effect no-submodule-imports
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/jsx/jsx';
import _ from 'lodash';
import React from 'react';
// @ts-ignore
import { Controlled as ControlledCodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';
import styled from 'styled-components';
import { WithRenderConfig, WithViewport } from '../render';
import './theme/vscode-dark-plus-html.css';
import './theme/vscode-dark-plus.css';

const StyledCodeMirror = styled(CodeMirror)<{ readonly options: { readonly readOnly: boolean } }>`
  .CodeMirror {
    background: #304148;
    font-family: 'Fira Code', monospace;
    padding: 1em;
    height: auto;

    @media (max-width: 768px) {
      padding: 1em 8px;
    }

    .CodeMirror-cursors {
      ${({ options }) => (options.readOnly ? 'display: none;' : '')};
    }

    .CodeMirror-lines {
      font-size: 16px;
      line-height: 1.4;

      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
  }
`;

const StyledControlledCodeMirror = styled(ControlledCodeMirror)<{ readonly options: { readonly readOnly: boolean } }>`
  .CodeMirror {
    background: #304148;
    font-family: 'Fira Code', monospace;
    padding: 1em;
    height: auto;

    @media (max-width: 768px) {
      padding: 1em 8px;
    }

    .CodeMirror-cursors {
      ${({ options }) => (options.readOnly ? 'display: none;' : '')};
    }

    .CodeMirror-lines {
      font-size: 16px;
      line-height: 1.4;

      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
  }
`;

interface Props {
  readonly code: string;
  readonly mode?: string;
  readonly readOnly?: boolean;
  readonly controlled?: boolean;
  readonly onChange?: (newCode: string) => void;
}

export class Editor extends React.Component<Props> {
  private readonly handleChange = _.debounce((_editor, _metadata, newCode) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(newCode);
    }
  }, 500);

  public shouldComponentUpdate(nextProps: Props) {
    return !!this.props.controlled && this.props.code !== nextProps.code;
  }

  public render() {
    const { code, readOnly, controlled, mode, ...props } = this.props;

    // tslint:disable-next-line no-any
    const ThisCodeMirror: any = controlled ? StyledControlledCodeMirror : StyledCodeMirror;

    return (
      <WithRenderConfig>
        {(config) => (
          <WithViewport>
            {({ width }) => (
              <ThisCodeMirror
                {...props}
                value={code}
                onChange={this.handleChange}
                options={{
                  ...config.editorConfig,
                  mode: mode === undefined ? 'text/typescript-jsx' : mode,
                  tabSize: 2,
                  theme: readOnly && width > 768 ? 'vscode-dark-plus-html' : 'vscode-dark-plus',
                  readOnly: width <= 768 || readOnly,
                }}
              />
            )}
          </WithViewport>
        )}
      </WithRenderConfig>
    );
  }
}
