import React from 'react';
import { AProps, Flex } from 'reakit';
import { EvalInContext } from '../../../../types';
import { styled } from '../../theme';
import { WithRenderConfig, WithState } from '../render';
import { Editor } from './Editor';
import { Preview } from './Preview';

const Wrapper = styled(Flex)`
  flex-direction: column;
  margin: 2em 0 3em;
`;

type Props = AProps<typeof Wrapper> & {
  readonly code: string;
  readonly exampleTemplate: string;
  readonly evalInContext: EvalInContext;
};

export const Playground = ({ code, evalInContext, exampleTemplate, ...props }: Props) => (
  <WithRenderConfig>
    {({ proxies }) => (
      <WithState initialState={{ state: code }}>
        {({ state, setState }) => (
          <Wrapper {...props}>
            <Preview code={state} evalInContext={evalInContext} exampleTemplate={exampleTemplate} proxies={proxies} />
            <Editor code={state} onChange={(c) => setState({ state: c.trim() })} />
          </Wrapper>
        )}
      </WithState>
    )}
  </WithRenderConfig>
);
