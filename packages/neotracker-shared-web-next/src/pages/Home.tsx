import gql from 'graphql-tag';
import * as React from 'react';
import styled from 'styled-components';
import { AppContext } from '../AppContext';
import { makeQuery } from '../components';
import { HomeQuery as HomeQueryData } from './__generated__/HomeQuery';

const ErrorBox = styled.div`
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
          const first = data.first == undefined ? undefined : <div>{data.first.hash}</div>;
          const second = data.second == undefined ? undefined : <div>{data.second.hash}</div>;

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

        return <div>Loading...</div>;
      }}
    </HomeQuery>
  );
}

export namespace Home {
  export const fetchDataForRoute = async (appContext: AppContext): Promise<void> => {
    await HomeQuery.fetchData(appContext);
  };
}
