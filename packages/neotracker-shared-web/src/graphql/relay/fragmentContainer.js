/* @flow */
import { type GraphQLTaggedNode, createFragmentContainer } from 'react-relay';
import * as React from 'react';

import { getFragment, getSelectorsFromObject } from 'relay-runtime';

import { compose, getContext, withProps } from 'recompose';

let fragmentContainer;
// flowlint-next-line sketchy-null-string:off
if (process.env.BUILD_FLAG_IS_SERVER) {
  fragmentContainer = (fragments: { [key: string]: GraphQLTaggedNode }) => {
    const fragmentSpec = {};
    for (const [key, fragment] of Object.entries(fragments)) {
      fragmentSpec[key] = getFragment(fragment);
    }
    return compose(
      getContext<*, *>({ relay: () => null }),
      withProps((props) => {
        const selectors = getSelectorsFromObject(
          props.relay,
          fragmentSpec,
          props,
        );
        return Object.entries(selectors).reduce((res, [key, selector]) => {
          if (Array.isArray(selector)) {
            res[key] = selector.map(
              (sel) => props.relay.environment.lookup(sel).data,
            );
          } else if (selector == null) {
            if (Array.isArray(props[key])) {
              res[key] = [];
            } else {
              res[key] = null;
            }
          } else {
            res[key] = props.relay.environment.lookup(selector).data;
          }
          return res;
        }, {});
      }),
    );
  };
} else {
  fragmentContainer = (fragments: { [key: string]: GraphQLTaggedNode }) => (
    WrappedComponent: React.ComponentType<any>,
  ) => createFragmentContainer(WrappedComponent, fragments);
}

const fragmentContainerExport = fragmentContainer;
export default fragmentContainerExport;
