/* @flow */
import { CodedError } from 'neotracker-server-utils';
import type {
  FragmentDefinitionNode,
  GraphQLResolveInfo,
  SelectionNode,
} from 'graphql';

type Fragments = {
  [fragmentName: string]: FragmentDefinitionNode,
  __proto__: null,
};
function parseFields<T: SelectionNode>(
  nodes: $ReadOnlyArray<T>,
  fragments: Fragments,
  treeIn: Object = {},
): Object {
  return nodes.reduce((tree, node) => {
    if (node.kind === 'Field') {
      if (node.selectionSet) {
        // eslint-disable-next-line no-param-reassign
        tree[node.name.value] = tree[node.name.value] || {};
        parseFields(
          (node.selectionSet || {}).selections || [],
          fragments,
          tree[node.name.value],
        );
      } else {
        // eslint-disable-next-line no-param-reassign
        tree[node.name.value] = true;
      }
    } else if (node.kind === 'FragmentSpread') {
      const fragment = fragments[node.name.value];
      if (fragment == null) {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }
      parseFields(fragment.selectionSet.selections, fragments, tree);
    } else if (node.kind === 'InlineFragment') {
      parseFields(node.selectionSet.selections, fragments, tree);
    }
    return tree;
  }, treeIn);
}
export default (info: GraphQLResolveInfo) =>
  parseFields(info.fieldNodes, info.fragments);
