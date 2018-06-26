export interface IFace {
  readonly interfaceName: string;
  readonly graphqlFields: ReadonlyArray<string>;
}

// tslint:disable-next-line no-unnecessary-class
export class Node {
  public static readonly interfaceName: string = 'Node';
  public static readonly graphqlFields: ReadonlyArray<string> = ['id'];
}
