import { Queries } from "@mewhhaha/little-router";

export type ValidPath<
  PATH extends string,
  PATTERN extends string,
  SEARCH extends Queries
> = PATH extends `${infer P}?${infer S}`
  ? ValidPathname<P, PATTERN> extends true
    ? ValidSearch<S, SEARCH> extends true
      ? PATH
      : never
    : never
  : ValidPathname<PATH, PATTERN> extends true
  ? PATH
  : never;

type ValidPathname<
  PATH extends string,
  PATTERN extends string
> = PATTERN extends `${infer PRE}:${string}/${infer PATTERN_REST}`
  ? PATH extends `${PRE}${string}/${infer PATH_REST}`
    ? ValidPathname<PATH_REST, PATTERN_REST>
    : false
  : PATTERN extends `${infer PRE}:${string}`
  ? PATH extends `${PRE}${infer PATH_REST}`
    ? PATH_REST extends ""
      ? false
      : true
    : [PATH] extends [PATTERN]
    ? true
    : never
  : never;

type ValidSearch<
  SEARCH_STRING extends string,
  SEARCH extends Queries
> = SplitUnion<SEARCH_STRING, "&"> extends QueryParams<SEARCH>
  ? true
  : SEARCH_STRING extends ""
  ? true
  : false;

// type ValidSearchTest = ValidSearch<
//   "sort=asc&size=2",
//   [["sort", string], ["size", string]]
// >;
// type ValidPathnameTest = ValidPathname<
//   "/users/1/dogs/2",
//   "/users/:id/dogs/:dog"
// >;
// type ValidPathTest = ValidPath<
//   "/users/1/dogs/2?sort=asc&size=2",
//   "/users/:id/dogs/:dog",
//   [["sort", string], ["size", string]]
// >;

type SplitUnion<
  T extends string,
  SEP extends string
> = T extends `${infer L}${SEP}${infer R}` ? L | SplitUnion<R, SEP> : T;

type QueryParams<T> = T extends [
  [infer KEY extends string, infer VALUE extends string | string[] | undefined],
  ...infer REST
]
  ?
      | (NonNullable<VALUE> extends (infer R extends string)[]
          ? `${KEY}[]=${R}`
          : NonNullable<VALUE> extends string
          ? `${KEY}=${NonNullable<VALUE>}`
          : never)
      | QueryParams<REST>
  : never;
