import styled from 'styled-components';
import { ifProp } from 'styled-tools';

interface Props {
  readonly column?: boolean;
}
export const ContentWrapper = styled.div<Props>`
  ${ifProp('column', 'flex-direction: column', '')};
  display: flex;
  align-items: center;
  max-width: 1200px;
  padding: 0 16px;
  width: 100%;
  height: 100%;
`;
