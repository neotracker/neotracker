// tslint:disable no-submodule-imports
import _ from 'lodash';
import * as React from 'react';
import { MdArrowDownward as ArrowDownIcon, MdArrowUpward as ArrowUpIcon } from 'react-icons/md';
import { Block, Button, Code, Heading, Hidden, Table } from 'reakit';
import { SectionConfig } from '../../../../types';
import { styled } from '../../theme';
import { findSectionPropInfo } from '../../utils';
import { WithRenderConfig } from '../render';
import { Icon } from './Icon';
import { TableWrapper } from './TableWrapper';

const StyledHeading = styled(Heading)`
  margin-bottom: 20px;
  @media (max-width: 768px) {
    margin-left: 16px;
    margin-right: 16px;
  }
`;

const NameCell = styled(Table.Cell)`
  color: ${({ theme }) => theme.identifier};
`;

const TypeCell = styled(Table.Cell)`
  color: ${({ theme }) => theme.type};
`;

const RequiredCell = styled(Table.Cell)`
  color: ${({ theme }) => theme.grayLight};
`;

export const PropsTable = ({ section }: { readonly section: SectionConfig }) => {
  if (section.type !== 'component') {
    // tslint:disable-next-line no-null-keyword
    return null;
  }

  return (
    <WithRenderConfig>
      {({ sections }) => {
        const propInfo = _.reverse(
          Object.entries(findSectionPropInfo(sections, section)).filter(([, value]) => !_.isEmpty(value)),
        );

        return (
          <Block>
            <StyledHeading<'h2'> as="h2">Props</StyledHeading>
            {propInfo.map(([compName, info], i) => (
              <Hidden.Container key={`${section.name}${compName}`} initialState={{ visible: i === 0 }}>
                {({ visible, toggle }) => (
                  <>
                    <Button borderColor="white" backgroundColor="#eee" onClick={toggle} width="100%" borderRadius={0}>
                      {compName}
                      {visible ? <Icon as={ArrowUpIcon} /> : <Icon as={ArrowDownIcon} />}
                    </Button>
                    {visible ? (
                      <TableWrapper>
                        <Table>
                          <Table.Head>
                            <Table.Row>
                              <Table.Cell header>Prop</Table.Cell>
                              <Table.Cell header>Type</Table.Cell>
                              <Table.Cell header>Required</Table.Cell>
                              <Table.Cell header>Default</Table.Cell>
                              <Table.Cell header>Description</Table.Cell>
                            </Table.Row>
                          </Table.Head>
                          <Table.Body>
                            {Object.entries(info).map(([name, { type, required, defaultValue, description }]) => (
                              <Table.Row key={name}>
                                <NameCell>{name}</NameCell>
                                <TypeCell>{type}</TypeCell>
                                <RequiredCell>{required ? 'Required' : ''}</RequiredCell>
                                <Table.Cell>{defaultValue ? <Code>{defaultValue}</Code> : undefined}</Table.Cell>
                                <Table.Cell>{description}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                      </TableWrapper>
                    ) : (
                      undefined
                    )}
                  </>
                )}
              </Hidden.Container>
            ))}
          </Block>
        );
      }}
    </WithRenderConfig>
  );
};
