import { RequestMethod } from "@mewhhaha/typed-request";
import { JSONString } from "@mewhhaha/generics-stringify";

type FetcherOptions = {
  base?: string;
};

type RouteDefinition = {
  pattern: string;
  json?: JSONString<any>;
  response: any;
};

type Method = Lowercase<RequestMethod>;

export const fetcher = <ROUTES extends Record<string, RouteDefinition>>(
  f: {
    fetch: (url: string, init?: RequestInit) => Promise<Response> | Response;
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

type FetcherFunction<ROUTE extends RouteDefinition> = (
  url: ROUTE["pattern"] | URLPattern<ROUTE["pattern"]>,
  init?: RequestInit & { body?: ROUTE["json"] }
) => Promise<ROUTE["response"]>;

type FetcherOf<ROUTES extends Record<string, RouteDefinition>> = {
  [KEY in keyof ROUTES]: UnionToIntersection<
    ROUTES[KEY] extends any ? FetcherFunction<ROUTES[KEY]> : never
  >;
} & {
  fetch: FetcherFunctionAny;
};

type URLPattern<T> = T extends `${infer PRE}:${string}/${infer POST}`
  ? `${PRE}${string}/${URLPattern<POST>}`
  : T extends `${infer PRE}:${string}`
  ? `${PRE}${string}`
  : T;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
