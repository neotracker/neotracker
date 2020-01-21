// tslint:disable-next-line
// TODO: reakit fix me
import React from 'react';
import { SectionConfig } from '../../../../types';
import { SectionContentWrapper } from './SectionContentWrapper';
import { TableWrapper } from './TableWrapper';

interface Props {
  readonly section: SectionConfig;
}

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

  // const { renderAPI } = component;

  return (
    <div {...props}>
      <SectionContentWrapper>
        <h2>API</h2>
        <p>
          Props passed to <code>children</code>.
        </p>
      </SectionContentWrapper>
      <TableWrapper>
        {/* <Table>
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
        </Table> */}
      </TableWrapper>
    </div>
  );
};
