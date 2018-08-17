import React from 'react';
// tslint:disable-next-line no-submodule-imports
import { GoPencil as PencilIcon } from 'react-icons/go';
import { AProps, Block, Button, Group, Tabs } from 'reakit';
import { EvalInContext } from '../../../../types';
import { styled } from '../../theme';
import { WithRenderConfig, WithState } from '../render';
import { Editor } from './Editor';
import { Preview } from './Preview';

const Wrapper = styled(Block)`
  position: relative;
  .CodeMirror-line:first-child {
    margin-right: 90px;
  }
  ${Tabs} {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 200;
    ${Button} {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(0, 0, 0, 0.5);
      text-transform: capitalize;
      font-size: 0.8em;
      font-weight: 100;
      grid-gap: 2px;
      padding: 0 8px;
      &.active {
        background-color: transparent;
      }
    }
  }
`;

const StyledPencilIcon = styled(PencilIcon)`
  @media (max-width: 768px) {
    display: none;
  }
`;

type Props = AProps<typeof Wrapper> & {
  readonly code: string;
  readonly fixtureCode: string;
  readonly exampleTemplate: string;
  readonly evalInContext: EvalInContext;
};

export const Playground = ({ code, fixtureCode, evalInContext, exampleTemplate, ...props }: Props) => (
  <WithRenderConfig>
    {({ proxies }) => (
      <WithState initialState={{ state: { code, fixtureCode } }}>
        {({ state, setState }) => (
          <Wrapper {...props}>
            <Preview
              code={state.code}
              fixtureCode={state.fixtureCode}
              evalInContext={evalInContext}
              exampleTemplate={exampleTemplate}
              proxies={proxies}
            />
            <Tabs.Container>
              {(tabs) => (
                <Wrapper>
                  <Tabs as={Group}>
                    <Tabs.Tab<Button> as={Button} tab="jsx" {...tabs}>
                      <StyledPencilIcon /> JSX
                    </Tabs.Tab>
                    <Tabs.Tab<Button> as={Button} tab="data" {...tabs}>
                      <StyledPencilIcon /> DATA
                    </Tabs.Tab>
                  </Tabs>
                  <Tabs.Panel tab="jsx" {...tabs}>
                    <Editor code={state.code} onChange={(c) => setState({ state: { ...state, code: c.trim() } })} />
                  </Tabs.Panel>
                  <Tabs.Panel tab="data" {...tabs}>
                    <Editor
                      code={state.fixtureCode}
                      onChange={(f) => setState({ state: { ...state, fixtureCode: f.trim() } })}
                    />
                  </Tabs.Panel>
                </Wrapper>
              )}
            </Tabs.Container>
          </Wrapper>
        )}
      </WithState>
    )}
  </WithRenderConfig>
);
