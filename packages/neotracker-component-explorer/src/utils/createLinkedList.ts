export interface LinkedItem<Item> {
  readonly value: Item;
  readonly next: () => LinkedItem<Item> | undefined;
}
export function createLinkedList<Item>(items: ReadonlyArray<Item>): LinkedItem<Item> {
  function advanceList(toIndex: number): LinkedItem<Item> {
    return {
      value: items[toIndex],
      next: advanceList.bind(undefined, toIndex + 1),
    };
  }

  return advanceList(0);
}
