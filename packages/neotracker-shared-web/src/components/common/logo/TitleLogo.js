/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

type ExternalProps = {|
  id: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};

function TitleLogo({ id }: Props): React.Element<*> {
  return (
    <svg
      width="145px"
      height="28px"
      viewBox="0 0 145 28"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="[title]"
    >
      <defs>
        <style>
          {`.cls-1{fill:#00e599;}`}
          {`.cls-2{fill:#00af92;}`}
        </style>
      </defs>
      <title id={`${id}Title`}>NEO Tracker Blockchain Explorer & Wallet</title>
      <desc id={`${id}Description`}>
        NEO Tracker Blockchain Explorer & Wallet
      </desc>
      <g>
        <title>NEO Tracker Logo</title>
        <g stroke="null" id="Layer_2">
          <g stroke="null" id="svg_5">
            <polygon
              stroke="null"
              id="svg_3"
              points="0.2608702175581401,5.032920339497025 0.2608702175581401,23.573866768403605 12.881187855344706,27.89130401611328 12.881187855344706,9.199931946897209 26.534788131713867,4.401099670176876 14.143215180391167,0.17391400394956946 0.2608702175581401,5.032920339497025 "
              className="cls-1"
            />
            <polygon
              stroke="null"
              id="svg_4"
              points="13.91447130070037,9.733963599952176 13.91447130070037,19.8731847399888 26.534788131713867,24.190642454847875 26.534788131713867,5.281133833165484 13.91447130070037,9.733963599952176 "
              className="cls-2"
            />
          </g>
        </g>
        <text
          fillOpacity="0.87"
          textAnchor="start"
          fontFamily="Roboto-Medium, Roboto"
          fontSize="20"
          id="svg_7"
          y="24"
          x="31"
          strokeWidth="0"
          stroke="#000"
          fill="#000000"
        >
          NEO Tracker
        </text>
      </g>
    </svg>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(TitleLogo): React.ComponentType<ExternalProps>);
