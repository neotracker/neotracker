// tslint:disable-next-line readonly-array no-any
function asArray<A extends any[] | ReadonlyArray<any>>(value: A | undefined): A {
  if (value === undefined) {
    // tslint:disable-next-line no-any
    return [] as any;
  }

  return value;
}

export const common = {
  asArray,
};
