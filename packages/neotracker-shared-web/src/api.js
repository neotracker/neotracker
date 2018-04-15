/* @flow */
import { graphql } from 'react-relay';

// eslint-disable-next-line
export const GAS_ISSUED_AVAILABLE = graphql`
  query apiGASIssuedAvailableQuery {
    asset(
      hash: "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7"
    ) {
      issued
      available
    }
  }
`;
