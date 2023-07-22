import { RequestMethod } from "@mewhhaha/typed-request";
import { FetchDefinition, Queries } from "@mewhhaha/little-router";
import { QueryParams, ValidPath } from "./valid-path.js";

type FetcherOptions = {
  base?: string;
};

type Method = Lowercase<RequestMethod>;

export const fetcher = <ROUTES extends FetchDefinition>(
  f: {
    fetch: (
      url: string,
      init?: Parameters<typeof fetch>[1]
    ) => ReturnType<typeof fetch>;
  },
  { base = "http://from.fetcher" }: FetcherOptions = {}
): FetcherOf<ROUTES> => {
  const fetchGeneric = (path: `/${string}`, init: RequestInit) => {
    return f.fetch(`${base}${path}`, init);
  };

  const handler: ProxyHandler<FetcherOf<ROUTES>> = {
    get: <METHOD extends Method>(_: unknown, method: METHOD | "fetch") => {
      if (method === "fetch") {
        return fetchGeneric;
      }

      const fetch_ = (path: `/${string}`, init: RequestInit) => {
        return f.fetch(`${base}${path}`, {
          method,
          ...init,
        });
      };

      return fetch_;
    },
  };

  return new Proxy({} as any, handler);
};

type FetcherFunction<
  PATTERN extends string,
  SEARCH extends Queries = Queries,
  INIT extends RequestInit | undefined = RequestInit,
  RESPONSE extends Response = Response
> = <PATH extends string>(
  url:
    | `${PATTERN}${`?${QueryParams<SEARCH>}` | ""}`
    | (ValidPath<PATH, PATTERN, SEARCH> extends true ? PATH : never),
  ...init: undefined extends INIT
    ? [
        init?: UndefinedToOptional<NonNullable<INIT>> &
          Omit<RequestInit, "method" | keyof INIT>
      ]
    : [
        init: UndefinedToOptional<NonNullable<INIT>> &
          Omit<RequestInit, "method" | keyof INIT>
      ]
) => Promise<RESPONSE>;

type FetcherFunctionAny = (
  url: `/${string}`,
  init?: RequestInit
) => Promise<Response>;

type FetcherOf<ROUTES extends FetchDefinition> = {
  [METHOD in Extract<Lowercase<ROUTES["method"]>, Method>]: OverloadFunction<
    Extract<ROUTES, { method: METHOD }>
  >;
} & {
  fetch: FetcherFunctionAny;
};

// type StringifyQueriesTest = StringifyQueries<
//   [["sort", "asc" | "desc"], ["size", "10"]]
// >;

type OverloadFunction<T> = UnionToIntersection<
  (T extends any ? InferFunction<T> : never) & NonNullable<unknown>
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type InferFunction<T> = T extends {
  pattern: infer PATTERN extends string;
  response: infer RESPONSE extends Response;
  search: infer SEARCH extends Queries;
  init: infer INIT extends RequestInit | undefined;
}
  ? FetcherFunction<PATTERN, SEARCH, INIT, RESPONSE>
  : never;

type UndefinedToOptional<T extends Record<string, any>> = keyof T extends any
  ? undefined extends T[keyof T]
    ? { [KEY in keyof T]?: T[KEY] }
    : { [KEY in keyof T]: T[KEY] }
  : never;
