import gql from 'graphql-tag';
import * as React from 'react';
import { Box, styled } from 'reakit';
import { AppContext } from '../AppContext';
import { makeQuery } from '../components';
import { HomeQuery as HomeQueryData } from './__generated__/HomeQuery';

const ErrorBox = styled(Box)`
  background-color: red;
  color: black;
  width: 00;
`;

const HomeQuery = makeQuery<HomeQueryData>({
  query: gql`
    query HomeQuery {
      first: block(index: 0) {
        id
        hash
      }
      second: block(index: 1) {
        id
        hash
      }
    }
  `,
});

export function Home() {
  return (
    <HomeQuery>
      {({ data, error }) => {
        if (data.first !== undefined || data.second !== undefined) {
          const first = data.first == undefined ? undefined : <Box>{data.first.hash}</Box>;
          const second = data.second == undefined ? undefined : <Box>{data.second.hash}</Box>;

          return (
            <>
              {first}
              {second}
            </>
          );
        }

        if (error) {
          return <ErrorBox>Error!</ErrorBox>;
        }

        return <Box>Loading...</Box>;
      }}
    </HomeQuery>
  );
}

export namespace Home {
  export const fetchDataForRoute = async (appContext: AppContext): Promise<void> => {
    await HomeQuery.fetchData(appContext);
  };
}
