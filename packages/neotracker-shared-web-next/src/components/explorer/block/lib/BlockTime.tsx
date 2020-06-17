import * as React from 'react';
import styled from 'styled-components';
import { TimeAgo as CommonTimeago } from '../../../common/timeago';
// import gql from 'graphql-tag';
// import { makeQuery } from '../../../../components';

const TimeAgo = styled(CommonTimeago)<any>`
  white-space: 'nowrap';
  overflow: 'hidden';
  text-overflow: 'ellipsis';
`;

// const TimeAgoQuery = makeQuery<any>({
//   query: gql`
//     timeAgo @client
//   `,
// });

interface Props {
  readonly blockTime: number | null | undefined;
}

export const BlockTime = ({ blockTime }: Props) => (
  // <TimeAgoQuery>
  //   {({ data }) => <TimeAgo variant="body1" data={data} time={blockTime} nullString="Pending" />}
  // </TimeAgoQuery>
  <TimeAgo variant="body1" time={blockTime} nullString="Pending" />
);
