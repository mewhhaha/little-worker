import { Queries } from "@mewhhaha/little-router";
import { StringifyQuery } from "./stringify-query.js";

export type ValidPath<
  PATH extends string,
  PATTERN extends string,
  SEARCH extends Queries
> = PATH extends `${infer P}?${infer S}`
  ? ValidPathname<P, PATTERN> extends true
    ? ValidSearch<S, SEARCH>
    : false
  : ValidPathname<PATH, PATTERN>;

export type ValidPathname<
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
    : false
  : PATH extends PATTERN
  ? true
  : PATTERN extends `${infer PRE}/*`
  ? PATH extends `${PRE}/${string}`
    ? true
    : false
  : false;

export type ValidSearch<
  SEARCH_STRING extends string,
  SEARCH extends Queries
> = SplitUnion<SEARCH_STRING, "&"> extends QueryParams<SEARCH>
  ? true
  : SEARCH_STRING extends ""
  ? true
  : false;

type SplitUnion<
  T extends string,
  SEP extends string
> = T extends `${infer L}${SEP}${infer R}` ? L | SplitUnion<R, SEP> : T;

export type QueryParams<T> = {
  [K in Extract<keyof T, string>]: StringifyQuery<K, T[K]>;
}[Extract<keyof T, string>];
