import { RequestMethod } from "@mewhhaha/typed-request";

type FetcherOptions = {
  base?: string;
};

type RouteDefinition = {
  method: string;
  pattern: string;
  init: RequestInit;
  response: Response;
};

type Method = Lowercase<RequestMethod>;

export const fetcher = <ROUTES extends RouteDefinition>(
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

type FetcherOf<ROUTES extends RouteDefinition> = {
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
  INIT extends RequestInit = RequestInit,
  RESPONSE extends Response = Response
> = <PATH extends string>(
  url:
    | PATTERN
    | (PATH extends BuildPath<PATTERN, PathParams<PATTERN, PATH>>
        ? PATH
        : never),
  ...init: RequestInit extends INIT
    ? [init?: Omit<RequestInit, "method">]
    : INIT extends {
        body?: infer BODY extends BodyInit | undefined;
        headers?: infer HEADERS extends HeadersInit | undefined;
      }
    ? [
        init: OptionalBody<BODY> &
          OptionalHeaders<HEADERS> &
          Omit<RequestInit, "body" | "headers" | "method">
      ]
    : never
) => Promise<RESPONSE>;

type OptionalBody<T> = undefined extends T ? { body?: T } : { body: T };

type OptionalHeaders<T> = undefined extends T
  ? {
      headers?: T;
    }
  : { headers: T };

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
  init?: infer INIT extends RequestInit;
}
  ? FetcherFunction<PATTERN, INIT, RESPONSE>
  : never;
