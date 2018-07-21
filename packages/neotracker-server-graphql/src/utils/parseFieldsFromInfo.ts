// tslint:disable prefer-switch no-object-mutation
import { CodedError } from '@neotracker/server-utils';
import {
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  GraphQLResolveInfo,
  InlineFragmentNode,
  SelectionNode,
} from 'graphql';

interface Fragments {
  readonly [fragmentName: string]: FragmentDefinitionNode;
}

const isFieldNode = (node: SelectionNode): node is FieldNode => node.kind === 'Field';
const isFragmentSpreadNode = (node: SelectionNode): node is FragmentSpreadNode => node.kind === 'FragmentSpread';
const isInlineFragmentNode = (node: SelectionNode): node is InlineFragmentNode => node.kind === 'InlineFragment';

// tslint:disable-next-line no-any
function parseFields<T extends SelectionNode>(nodes: ReadonlyArray<T>, fragments: Fragments, treeIn: any = {}): any {
  return nodes.reduce((tree, node) => {
    if (isFieldNode(node)) {
      if (node.selectionSet) {
        // eslint-disable-next-line no-param-reassign
        tree[node.name.value] = tree[node.name.value] === undefined ? {} : tree[node.name.value];
        parseFields(node.selectionSet.selections, fragments, tree[node.name.value]);
      } else {
        // eslint-disable-next-line no-param-reassign
        tree[node.name.value] = true;
      }
    } else if (isFragmentSpreadNode(node)) {
      const fragment = fragments[node.name.value] as FragmentDefinitionNode | undefined;
      if (fragment === undefined) {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }
      parseFields(fragment.selectionSet.selections, fragments, tree);
    } else if (isInlineFragmentNode(node)) {
      parseFields(node.selectionSet.selections, fragments, tree);
    }

    return tree;
  }, treeIn);
}
export const parseFieldsFromInfo = (info: GraphQLResolveInfo) => parseFields(info.fieldNodes, info.fragments);
