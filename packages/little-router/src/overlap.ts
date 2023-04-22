const SAME_LENGTH = Symbol();
const A_LONGER_LENGTH = Symbol();
const A_SHORTER_LENGTH = Symbol();

const HAS_WILDCARD = Symbol();
const HAS_NO_WILDCARD = Symbol();

type CompareLength<A, B> = A extends `/${string}${infer A_REST}`
  ? B extends `/${string}${infer B_REST}`
    ? CompareLength<A_REST, B_REST>
    : typeof A_LONGER_LENGTH
  : B extends `/${string}`
  ? typeof A_SHORTER_LENGTH
  : typeof SAME_LENGTH;

type AnyParam<B> = B extends `${string}/:${string}`
  ? typeof HAS_WILDCARD
  : B extends `${string}*${string}`
  ? typeof HAS_WILDCARD
  : typeof HAS_NO_WILDCARD;

export type HasOverlap<A, B> = CompareLength<A, B> extends typeof SAME_LENGTH
  ? AnyParam<B> extends typeof HAS_WILDCARD
    ? true
    : false
  : CompareLength<A, B> extends typeof A_SHORTER_LENGTH
  ? false
  : B extends `${string}*${string}`
  ? true
  : false;
