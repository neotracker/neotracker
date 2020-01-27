// @ts-ignore
import { compiler } from 'markdown-to-jsx';
import React from 'react';
// tslint:disable-next-line no-submodule-imports
import { MdOpenInNew as OpenInNewIcon } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { Blockquote } from './Blockquote';
import { Editor } from './Editor';

const StyledParagraph = styled.p`
  line-height: 1.5;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const StyledHeading = styled.h1`
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const StyledList = styled.ol`
  list-style: initial;
  padding-left: 2em;

  li {
    line-height: 1.5;
  }
`;

// tslint:disable-next-line no-any
const Anchor = ({ href, ...props }: any) => {
  if (/^(http|www)/.test(href)) {
    return (
      <a href={href} target="_blank" {...props}>
        {props.children}
        <OpenInNewIcon />
      </a>
    );
  }

  return <a as={RouterLink} to={href} {...props} />;
};

// tslint:disable-next-line no-any
const CodeBlock = ({ children }: any) => (
  <Editor readOnly code={unescape(children.props.children.replace(/<[^>]+>/g, ''))} />
);

const StyledCode = styled.code`
  /* empty for now */
`;

const overrides = {
  p: StyledParagraph,
  a: Anchor,
  ul: StyledList,
  code: StyledCode,
  pre: CodeBlock,
  blockquote: Blockquote,
  ol: StyledList,
  h1: StyledHeading.withComponent('h1'),
  h2: StyledHeading.withComponent('h2'),
  h3: StyledHeading.withComponent('h3'),
  h4: StyledHeading.withComponent('h4'),
  h5: StyledHeading.withComponent('h5'),
  h6: StyledHeading.withComponent('h6'),
};

export const Markdown = ({ text }: { readonly text: string }) => compiler(text, { overrides, forceBlock: true });
