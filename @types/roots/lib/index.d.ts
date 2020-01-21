// tslint:disable
declare interface ReadonlyArray<T> {
  sort(compareFn?: (a: T, b: T) => number): this;
  reverse(): this;
}

interface ArrayConstructor {
  isArray(arg: any): arg is any[];
  isArray<T, O>(arg: ReadonlyArray<T> | O): arg is ReadonlyArray<T>;
}

type Diff<T extends string | number | symbol, U extends string | number | symbol> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends string | number | symbol> = Pick<T, Diff<keyof T, K>>;
type CProps<C extends React.ComponentType<any>> = any;
// type CProps<C extends React.ComponentType<any>> = C extends React.ComponentType<infer P> ? P : never;
type Writable<T> = { -readonly [P in keyof T]: T[P] };

// Drop equivalency
// unfortunately we can't drop elements the way we want, but this one is also much useful.
type DropEqv<T extends any[], E extends any[]> = {
  0: T;
  1: DropEqv<Drop1<T>, Drop1<E>>;
  2: DropEqv<Drop2<T>, Drop2<E>>;
  4: DropEqv<Drop4<T>, Drop4<E>>;
  8: DropEqv<Drop8<T>, Drop8<E>>;
}[Measure<E['length']>];
// concat reversely (left part)
type ConcatRev<A extends any[], B extends any[] = []> = {
  0: B;
  1: ConcatRev<Drop1<A>, ConcatRev1<A, B>>;
  2: ConcatRev<Drop2<A>, ConcatRev2<A, B>>;
  4: ConcatRev<Drop4<A>, ConcatRev4<A, B>>;
  8: ConcatRev<Drop8<A>, ConcatRev8<A, B>>;
}[Measure<A['length']>];
// concat reversely and make optional (left part)
type ConcatRev$<A extends any[], B extends any[] = []> = {
  0: B;
  1: ConcatRev$<Drop1<A>, ConcatRev1$<A, B>>;
  2: ConcatRev$<Drop2<A>, ConcatRev2$<A, B>>;
  4: ConcatRev$<Drop4<A>, ConcatRev4$<A, B>>;
  8: ConcatRev$<Drop8<A>, ConcatRev8$<A, B>>;
}[Measure<A['length']>];
// alias and helpers

// reverse
type Reverse<T extends any[]> = ConcatRev<T>;

// reverse and make optional
type Reverse$<T extends any[]> = ConcatRev$<T>;

// concat
type Concat<A extends any[], B extends any[] = []> = ConcatRev<ConcatRev<A>, B>;

// concat and make optional
type Concat$<A extends any[], B extends any[] = []> = ConcatRev$<ConcatRev$<A>, B>;

type Head<T extends any[]> = Take1<T>[0];

type Tail<T extends any[]> = Drop1<T>;

type Unshift<T extends any[], X> = ConcatRev1<[X], T>;

type Push<T extends any[], X> = ConcatRev<ConcatRev1<[X], ConcatRev<T>>>;

type Indices<T> = Exclude<keyof T, keyof []>;

// to bypass type checker
type AsTuple<T> = T extends any[] ? T : never;

// Beware of dragons

type Measure<T extends number> = T extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  ? T extends 0 | 1 | 2 | 3 ? (T extends 0 | 1 ? (T extends 0 ? 0 : 1) : 2) : 4
  : number extends T ? never : 8;
type Drop1<T extends any[]> = ((..._: T) => 0) extends (a0?: any, ..._: infer R) => 0 ? R : never;
type Drop2<T extends any[]> = ((..._: T) => 0) extends (a0?: any, a1?: any, ..._: infer R) => 0 ? R : never;
type Drop4<T extends any[]> = ((..._: T) => 0) extends (a0?: any, a1?: any, a2?: any, a3?: any, ..._: infer R) => 0
  ? R
  : never;
type Drop8<T extends any[]> = ((..._: T) => 0) extends (
  a0?: any,
  a1?: any,
  a2?: any,
  a3?: any,
  a4?: any,
  a5?: any,
  a6?: any,
  a7?: any,
  ..._: infer R
) => 0
  ? R
  : never;
type Take1<T extends any[]> = ((..._: T) => 0) extends ((a0: infer A0, ..._: any[]) => 0) ? [A0] : never;
type Take2<T extends any[]> = ((..._: T) => 0) extends ((a0: infer A0, a1: infer A1, ..._: any[]) => 0)
  ? [A0, A1]
  : never;
type Take4<T extends any[]> = ((..._: T) => 0) extends ((
  a0: infer A0,
  a1: infer A1,
  a2: infer A2,
  a3: infer A3,
  ..._: any[]
) => 0)
  ? [A0, A1, A2, A3]
  : never;
type Take8<T extends any[]> = ((..._: T) => 0) extends ((
  a0: infer A0,
  a1: infer A1,
  a2: infer A2,
  a3: infer A3,
  a4: infer A4,
  a5: infer A5,
  a6: infer A6,
  a7: infer A7,
  ..._: any[]
) => 0)
  ? [A0, A1, A2, A3, A4, A5, A6, A7]
  : never;
type Take1$<T extends any[]> = ((..._: T) => 0) extends ((a0: infer A0, ..._: any[]) => 0) ? [A0?] : never;
type Take2$<T extends any[]> = ((..._: T) => 0) extends ((a0: infer A0, a1: infer A1, ..._: any[]) => 0)
  ? [A0?, A1?]
  : never;
type Take4$<T extends any[]> = ((..._: T) => 0) extends ((
  a0: infer A0,
  a1: infer A1,
  a2: infer A2,
  a3: infer A3,
  ..._: any[]
) => 0)
  ? [A0?, A1?, A2?, A3?]
  : never;
type Take8$<T extends any[]> = ((..._: T) => 0) extends ((
  a0: infer A0,
  a1: infer A1,
  a2: infer A2,
  a3: infer A3,
  a4: infer A4,
  a5: infer A5,
  a6: infer A6,
  a7: infer A7,
  ..._: any[]
) => 0)
  ? [A0?, A1?, A2?, A3?, A4?, A5?, A6?, A7?]
  : never;
type ConcatRev1<A extends any[], B extends any[]> = ((a0: A[0], ..._: B) => 0) extends (..._: infer R) => 0 ? R : never;
type ConcatRev2<A extends any[], B extends any[]> = ((a0: A[1], a1: A[0], ..._: B) => 0) extends (..._: infer R) => 0
  ? R
  : never;
type ConcatRev4<A extends any[], B extends any[]> = ((a0: A[3], a1: A[2], a2: A[1], a3: A[0], ..._: B) => 0) extends (
  ..._: infer R
) => 0
  ? R
  : never;
type ConcatRev8<A extends any[], B extends any[]> = ((
  a0: A[7],
  a1: A[6],
  a2: A[5],
  a3: A[4],
  a4: A[3],
  a5: A[2],
  a6: A[1],
  a7: A[0],
  ..._: B
) => 0) extends (..._: infer R) => 0
  ? R
  : never;
type ConcatRev1$<A extends any[], B extends any[]> = ((a0?: A[0], ..._: B) => 0) extends (..._: infer R) => 0
  ? R
  : never;
type ConcatRev2$<A extends any[], B extends any[]> = ((a0?: A[1], a1?: A[0], ..._: B) => 0) extends (..._: infer R) => 0
  ? R
  : never;
type ConcatRev4$<A extends any[], B extends any[]> = ((
  a0?: A[3],
  a1?: A[2],
  a2?: A[1],
  a3?: A[0],
  ..._: B
) => 0) extends (..._: infer R) => 0
  ? R
  : never;
type ConcatRev8$<A extends any[], B extends any[]> = ((
  a0?: A[7],
  a1?: A[6],
  a2?: A[5],
  a3?: A[4],
  a4?: A[3],
  a5?: A[2],
  a6?: A[1],
  a7?: A[0],
  ..._: B
) => 0) extends (..._: infer R) => 0
  ? R
  : never;
