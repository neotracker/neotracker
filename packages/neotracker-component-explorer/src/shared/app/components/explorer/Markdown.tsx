// @ts-ignore
import { compiler } from 'markdown-to-jsx';
import React from 'react';
// tslint:disable-next-line no-submodule-imports
import { MdOpenInNew as OpenInNewIcon } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import { Code, Heading, Link, List, Paragraph, styled } from 'reakit';
import { Blockquote } from './Blockquote';
import { Editor } from './Editor';

const StyledParagraph = styled(Paragraph)`
  line-height: 1.5;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const StyledHeading = styled(Heading)`
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const StyledList = styled(List)`
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
      <Link href={href} target="_blank" {...props}>
        {props.children}
        <OpenInNewIcon />
      </Link>
    );
  }

  return <Link as={RouterLink} to={href} {...props} />;
};

// tslint:disable-next-line no-any
const CodeBlock = ({ children }: any) => (
  <Editor readOnly code={unescape(children.props.children.replace(/<[^>]+>/g, ''))} />
);

// tslint:disable-next-line no-any
const asComponent = (component: React.ComponentType<any>, as: string) => ({ component, props: { as } });

const overrides = {
  p: StyledParagraph,
  a: Anchor,
  ul: StyledList,
  code: Code,
  pre: CodeBlock,
  blockquote: Blockquote,
  ol: asComponent(List, 'ol'),
  h1: asComponent(StyledHeading, 'h1'),
  h2: asComponent(StyledHeading, 'h2'),
  h3: asComponent(StyledHeading, 'h3'),
  h4: asComponent(StyledHeading, 'h4'),
  h5: asComponent(StyledHeading, 'h5'),
  h6: asComponent(StyledHeading, 'h6'),
};

export const Markdown = ({ text }: { readonly text: string }) => compiler(text, { overrides, forceBlock: true });
