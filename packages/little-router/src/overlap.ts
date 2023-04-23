const SAME_LENGTH = Symbol();
const A_LONGER_LENGTH = Symbol();
const A_SHORTER_LENGTH = Symbol();

type CompareLength<A, B> = A extends `/${string}${infer A_REST}`
  ? B extends `/${string}${infer B_REST}`
    ? CompareLength<A_REST, B_REST>
    : typeof A_LONGER_LENGTH
  : B extends `/${string}`
  ? typeof A_SHORTER_LENGTH
  : typeof SAME_LENGTH;

type StringifyParam<
  A,
  REPLACEMENT extends string = ""
> = A extends `${infer PRE}:${string}/${infer A_REST}`
  ? `${PRE}${REPLACEMENT}${StringifyParam<`/${A_REST}`, REPLACEMENT>}`
  : A extends `${infer PRE}:${string}`
  ? `${PRE}${REPLACEMENT}`
  : A extends `/*`
  ? `/${string}`
  : A;

export type HasOverlap<A, B> = CompareLength<A, B> extends typeof SAME_LENGTH
  ? StringifyParam<A> extends StringifyParam<B, string>
    ? true
    : false
  : CompareLength<A, B> extends typeof A_SHORTER_LENGTH
  ? false
  : B extends `${string}*${string}`
  ? true
  : false;
