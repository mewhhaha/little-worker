import { RequestMethod, SearchString } from "@mewhhaha/typed-request";
import { FetchDefinition } from "@mewhhaha/little-router";

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

type FetcherFunctionAny = (
  url: `/${string}`,
  init?: RequestInit
) => Promise<Response>;

type FetcherOf<ROUTES extends FetchDefinition> = {
  [METHOD in ROUTES["method"]]: OverloadFunction<
    Extract<ROUTES, { method: METHOD }>
  >;
} & {
  fetch: FetcherFunctionAny;
};

type BuildPath<PATTERN, PARAMS extends string> = Extract<
  PARAMS,
  `${string}/${string}` // Don't allow slashes in params
> extends never
  ? PATTERN extends `${infer PRE}:${string}/${infer POST}`
    ? `${PRE}${PARAMS}/${BuildPath<POST, PARAMS>}`
    : PATTERN extends `${infer PRE}:${string}`
    ? `${PRE}${PARAMS}`
    : PATTERN
  : never;

type PathParams<PATTERN, PATH> =
  PATTERN extends `${infer PRE}:${string}/${infer PATTERN_REST}`
    ? PATH extends `${PRE}${infer PARAM}/${infer PATH_REST}`
      ? PARAM | PathParams<PATTERN_REST, PATH_REST>
      : never
    : PATTERN extends `${infer PRE}:${string}`
    ? PATH extends `${PRE}${infer PARAM}`
      ? PARAM
      : never
    : never;

type FetcherFunction<
  PATTERN extends string,
  SEARCH extends string | undefined = string,
  INIT extends RequestInit | undefined = RequestInit,
  RESPONSE extends Response = Response
> = <PATH extends string>(
  url:
    | `${PATTERN}${SEARCH extends undefined
        ? ""
        : string extends SEARCH
        ? ""
        : `?${SEARCH}` | ""}`
    | (PATH extends `${infer P}?${infer S}`
        ? P extends `${BuildPath<PATTERN, PathParams<PATTERN, P>>}`
          ? SearchString<`?${S}`, NonNullable<SEARCH>> extends never
            ? never
            : PATH
          : never
        : PATH extends `${BuildPath<PATTERN, PathParams<PATTERN, PATH>>}`
        ? PATH
        : never),
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

type X = SearchString<
  "?sort=asc&size=10",
  `sort=${"asc" | "desc"}` | `size=${number}`
>;

type UndefinedToOptional<T extends Record<string, any>> = keyof T extends any
  ? undefined extends T[keyof T]
    ? { [KEY in keyof T]?: T[KEY] }
    : { [KEY in keyof T]: T[KEY] }
  : never;

type OverloadFunction<T> = UnionToIntersection<
  (T extends any ? InferFunction<T> : never) & {}
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type InferFunction<T> = T extends {
  pattern: infer PATTERN extends string;
  response: infer RESPONSE extends Response;
  search: infer SEARCH extends string | undefined;
  init: infer INIT extends RequestInit | undefined;
}
  ? FetcherFunction<PATTERN, SEARCH, INIT, RESPONSE>
  : never;
