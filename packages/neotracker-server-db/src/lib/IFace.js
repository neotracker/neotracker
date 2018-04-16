/* @flow */
export default class IFace {
  static interfaceName: string;
  static graphqlFields: Array<string>;
}

export class Node extends IFace {
  static interfaceName: string = 'Node';
  static graphqlFields: Array<string> = ['id'];
}
