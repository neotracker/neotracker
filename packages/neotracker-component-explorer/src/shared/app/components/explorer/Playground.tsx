// tslint:disable
// TODO: reakit fix me
import React from 'react';
// tslint:disable-next-line no-submodule-imports
// import { GoPencil as PencilIcon } from 'react-icons/go';
import styled from 'styled-components';
import { EvalInContext } from '../../../../types';
import { WithRenderConfig, WithState } from '../render';
// import { Editor } from './Editor';
import { Preview } from './Preview';

/* ${Tabs} {
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
  } */
const Wrapper = styled.div`
  position: relative;

  .CodeMirror-line:first-child {
    margin-right: 90px;
  }
`;

// const StyledPencilIcon = styled(PencilIcon)`
//   @media (max-width: 768px) {
//     display: none;
//   }
// `;

interface Props {
  readonly code: string;
  readonly fixtureCode: string;
  readonly exampleTemplate: string;
  readonly evalInContext: EvalInContext;
}

export const Playground = ({ code, fixtureCode, evalInContext, exampleTemplate, ...props }: Props) => (
  <WithRenderConfig>
    {({ proxies }) => (
      <WithState initialState={{ code, fixtureCode }}>
        {({ state, setState }) => (
          <Wrapper {...props}>
            <Preview
              code={state.code}
              fixtureCode={state.fixtureCode}
              evalInContext={evalInContext}
              exampleTemplate={exampleTemplate}
              proxies={proxies}
            />
            {/* <Tabs.Container>
              {(tabs: any) => (
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
                    <Editor code={state.code} onChange={(c) => setState({ code: c.trim() })} />
                  </Tabs.Panel>
                  <Tabs.Panel tab="data" {...tabs}>
                    <Editor code={state.fixtureCode} onChange={(f) => setState({ fixtureCode: f.trim() })} />
                  </Tabs.Panel>
                </Wrapper>
              )}
            </Tabs.Container> */}
          </Wrapper>
        )}
      </WithState>
    )}
  </WithRenderConfig>
);
