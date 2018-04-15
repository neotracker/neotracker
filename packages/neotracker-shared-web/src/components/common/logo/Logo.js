/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

type ExternalProps = {|
  id: string,
  width?: number,
  height?: number,
  white?: boolean,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Logo({
  id,
  width,
  height,
  white,
  className,
}: Props): React.Element<*> {
  const a = `${id}a`;
  const b = `${id}b`;
  let defs;
  let g = (
    <g fill="none">
      <path
        stroke="#FFFFFF"
        strokeWidth=".265"
        fill="#FFFFFF"
        d="M9.596 9.367l13.428-4.873L13.806.05.61 4.99z"
      />
      <path
        fill="#FFFFFF"
        d="M23.455 5.124l-9.715 3.38.033 10.047 9.582 4.546"
      />
      <path
        fill="#FFFFFF"
        d="M9.264 9.997L.047 5.587l.066 17.838 9.184 4.443"
      />
    </g>
  );
  if (!white) {
    defs = (
      <defs>
        <linearGradient
          x1="45.734%"
          y1="-4.797%"
          x2="45.392%"
          y2="144.834%"
          id={a}
        >
          <stop stopColor="#58BE23" offset="0%" />
          <stop stopColor="#58BE23" stopOpacity="0" offset="100%" />
        </linearGradient>
        <linearGradient
          x1="40.502%"
          y1="1.637%"
          x2="44.803%"
          y2="114.732%"
          id={b}
        >
          <stop stopColor="#58BE23" offset="0%" />
          <stop stopColor="#58BE23" stopOpacity="0" offset="100%" />
        </linearGradient>
      </defs>
    );
    g = (
      <g fill="none">
        <path
          stroke="#58BE23"
          strokeWidth=".265"
          fill="#58BE23"
          d="M9.596 9.367l13.428-4.873L13.806.05.61 4.99z"
        />
        <path
          fill={`url(#${a})`}
          d="M23.455 5.124l-9.715 3.38.033 10.047 9.582 4.546"
        />
        <path
          fill={`url(#${b})`}
          d="M9.264 9.997L.047 5.587l.066 17.838 9.184 4.443"
        />
      </g>
    );
  }
  return (
    <svg
      className={className}
      width={`${width == null ? 24 : width}px`}
      height={`${height == null ? 28 : height}px`}
      viewBox="0 0 24 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      {defs}
      {g}
    </svg>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(Logo): React.ComponentType<ExternalProps>);
