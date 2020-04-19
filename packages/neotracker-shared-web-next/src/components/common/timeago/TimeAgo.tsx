import { TypographyProps } from '@material-ui/core/Typography';
import gql from 'graphql-tag';
import * as React from 'react';
import { makeQuery } from '../../../components';
import { Typography } from '../../../lib/base';
import { formatTime } from '../../../utils';

interface Props extends TypographyProps {
  readonly time: number | null | undefined;
  readonly nullString?: string;
  readonly prefix?: string;
}

const InnerTime = makeQuery({
  query: gql`
    query InnerTime {
      timeAgo @client
    }
  `,
});

export const TimeAgo = ({ time, nullString, prefix, ...otherProps }: Props) => (
  <InnerTime>
    {(_props) => {
      let value = time == undefined ? nullString : formatTime(time);
      if (prefix !== undefined) {
        // tslint:disable-next-line: strict-boolean-expressions
        value = `${prefix}${value || ''}`;
      }

      return <Typography {...otherProps}>{value}</Typography>;
    }}
  </InnerTime>
);
