import React from 'react';
import { AProps, Block, Code, Heading, Paragraph, Table } from 'reakit';
import { SectionConfig } from '../../../../types';
import { SectionContentWrapper } from './SectionContentWrapper';
import { TableWrapper } from './TableWrapper';

type Props = AProps<Block> & {
  readonly section: SectionConfig;
};

export const RenderAPITable = ({ section, ...props }: Props) => {
  if (section.type !== 'component') {
    // tslint:disable-next-line no-null-keyword
    return null;
  }
  const { component } = section;
  if (component.renderAPI === undefined) {
    // tslint:disable-next-line no-null-keyword
    return null;
  }

  const { renderAPI } = component;

  return (
    <Block {...props}>
      <SectionContentWrapper column>
        <Heading<'h2'> as="h2">API</Heading>
        <Paragraph>
          Props passed to <Code>children</Code>.
        </Paragraph>
      </SectionContentWrapper>
      <TableWrapper>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell header>Name</Table.Cell>
              <Table.Cell header>Type</Table.Cell>
              <Table.Cell header>Initial value</Table.Cell>
              <Table.Cell header>Description</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {Object.entries(renderAPI).map(([key, { type, description, initialValue }]) => (
              <Table.Row key={key}>
                <Table.Cell>
                  <Code>{key}</Code>
                </Table.Cell>
                <Table.Cell>
                  <Code>{type}</Code>
                </Table.Cell>
                <Table.Cell>{initialValue}</Table.Cell>
                <Table.Cell>{description}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </TableWrapper>
    </Block>
  );
};
