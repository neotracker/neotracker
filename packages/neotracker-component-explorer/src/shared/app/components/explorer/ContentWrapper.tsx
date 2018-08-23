import { Flex, styled } from 'reakit';

interface Props {
  readonly column?: boolean;
  readonly children?: React.ReactNode;
}
export const ContentWrapper = styled<Props>(Flex)`
  align-items: center;
  max-width: 1200px;
  padding: 0 16px;
  width: 100%;
  height: 100%;
`;
