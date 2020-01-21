// tslint:disable
// TODO: reakit fix me
// import _ from 'lodash';
import * as React from 'react';
// tslint:disable-next-line no-submodule-imports
// import { MdArrowDownward as ArrowDownIcon, MdArrowUpward as ArrowUpIcon } from 'react-icons/md';
import styled from 'styled-components';
import { SectionConfig } from '../../../../types';
// import { findSectionPropInfo } from '../../utils';
import { WithRenderConfig } from '../render';
// import { Icon } from './Icon';
// import { TableWrapper } from './TableWrapper';

// const DataCell = styled.div`
//   display: table-cell;
//   border: inherit;
//   padding: 4px 8px;
//   vertical-align: middle;
// `;
// const HeaderCell = styled(DataCell)`
//   font-weight: bold;
//   background-color: rgba(0, 0, 0, 0.05);
// `;

const StyledHeading = styled.h1`
  margin-bottom: 20px;

  @media (max-width: 768px) {
    margin-left: 16px;
    margin-right: 16px;
  }
`;

// const NameCell = styled(DataCell)`
//   color: ${({ theme }) => theme.identifier};
// `;

// const TypeCell = styled(DataCell)`
//   color: ${({ theme }) => theme.type};
// `;

// const RequiredCell = styled(DataCell)`
//   color: ${({ theme }) => theme.grayLight};
// `;

export const PropsTable = ({ section }: { readonly section: SectionConfig }) => {
  if (section.type !== 'component') {
    // tslint:disable-next-line no-null-keyword
    return null;
  }

  return (
    <WithRenderConfig>
      {({ sections }) => {
        // const propInfo = _.reverse(
        //   Object.entries(findSectionPropInfo(sections, section)).filter(([, value]) => !_.isEmpty(value)),
        // );

        return (
          <div>
            <StyledHeading as="h2">Props</StyledHeading>
            {/* {propInfo.map(([compName, info], i) => (
              <Hidden.Container key={`${section.name}${compName}`} initialState={{ visible: i === 0 }}>
                {({ visible, toggle }: any) => (
                  <>
                    <Button borderColor="white" backgroundColor="#eee" onClick={toggle} width="100%" borderRadius={0}>
                      {compName}
                      {visible ? <Icon as={ArrowUpIcon} /> : <Icon as={ArrowDownIcon} />}
                    </Button>
                    {visible ? (
                      <TableWrapper>
                        <Table>
                          <thead>
                            <tr>
                              <HeaderCell>Prop</HeaderCell>
                              <HeaderCell>Type</HeaderCell>
                              <HeaderCell>Required</HeaderCell>
                              <HeaderCell>Default</HeaderCell>
                              <HeaderCell>Description</HeaderCell>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(info).map(([name, { type, required, defaultValue, description }]) => (
                              <Base as="tr" key={name}>
                                <NameCell>{name}</NameCell>
                                <TypeCell>{type}</TypeCell>
                                <RequiredCell>{required ? 'Required' : ''}</RequiredCell>
                                <DataCell>{defaultValue ? <Code>{defaultValue}</Code> : undefined}</DataCell>
                                <DataCell>{description}</DataCell>
                              </Base>
                            ))}
                          </tbody>
                        </Table>
                      </TableWrapper>
                    ) : (
                      undefined
                    )}
                  </>
                )}
              </Hidden.Container>
            ))} */}
          </div>
        );
      }}
    </WithRenderConfig>
  );
};
