import gql from 'graphql-tag';
import * as React from 'react';
import styled from 'styled-components';
import { AppContext } from '../AppContext';
import { makeQuery } from '../components';
import { BlockTable } from '../components/explorer/block/BlockTable';
import { useQuery } from '../components/render/useQuery';
import { HomeQuery as HomeQueryData } from './__generated__/HomeQuery';

const ErrorBox = styled.div`
  background-color: red;
  color: black;
  width: 00;
`;

// const HomeQuery = makeQuery<any>({
//   query: gql`
//     query HomeQuery {
//       blocks(orderBy: [{ name: "block.id", direction: "desc" }], first: 16) {
//         edges {
//           node {
//             id
//             time
//             transaction_count
//             validator_address_id
//             size
//           }
//         }
//       }
//     }
//   `,
// });

// export function Home() {
//   return (
//     <HomeQuery>
//       {({ data, error, loading }) => {
//         if (loading) {
//           return <div>Loading...</div>;
//         }
//         if (data.blocks !== undefined) {
//           return (
//             <BlockTable
//               blocks={data.blocks.edges.map((edge) => edge.node)}
//               sizeVisibleAt="xs"
//               validatorVisibleAt="md"
//             />
//           );
//         }

//         return <ErrorBox>Error!</ErrorBox>;
//       }}
//     </HomeQuery>
//   );
// }

const query = gql`
  query HomeQuery {
    blocks(orderBy: [{ name: "block.id", direction: "desc" }], first: 16) {
      edges {
        node {
          id
          time
          transaction_count
          validator_address_id
          size
        }
      }
    }
  }
`;

export function Home() {
  const [queryResult] = useQuery<any>({ query });

  if (queryResult === undefined) {
    return <div>Loading...</div>;
  }
  const { data, loading } = queryResult;
  if (loading) {
    return <div>Loading...</div>;
  }
  if (data.blocks !== undefined) {
    return (
      <BlockTable blocks={data.blocks.edges.map((edge) => edge.node)} sizeVisibleAt="xs" validatorVisibleAt="md" />
    );
  }

  return <ErrorBox>Error!</ErrorBox>;
}

// tslint:disable-next-line: no-object-mutation
Home.fetchDataForRoute = async (appContext: AppContext): Promise<void> => {
  const [, fetchData] = useQuery({ query });
  await fetchData(appContext);
};

// export namespace Home {
//   export const fetchDataForRoute = async (appContext: AppContext): Promise<void> => {
//     await fetchData(appContext);
//   };
// }
