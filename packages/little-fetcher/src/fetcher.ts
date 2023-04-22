import { RequestMethod } from "@mewhhaha/typed-request";

type FetcherOptions = {
  base?: string;
};

export const fetcher = <ROUTES extends Record<string, never>>(
  f: { fetch: (url: string, init?: RequestInit) => Promise<Response> },
  { base = "http://from.fetcher" }: FetcherOptions = {}
): FetcherRouter<ROUTES> => {
  const fetchGeneric = (path: `/${string}`, init: RequestInit) => {
    return f.fetch(`${base}${path}`, init);
  };

  const handler: ProxyHandler<FetcherRouter<ROUTES>> = {
    get: <METHOD extends RequestMethod>(
      _: unknown,
      method: METHOD | "fetch"
    ) => {
      if (method === "fetch") {
        return fetchGeneric;
      }

      const fetch_ = (
        path: `/${string}`,
        {
          params,
          value,
          ...init
        }: Omit<RequestInit, "method"> & {
          params?: Record<string, string>;
          value?: unknown;
        } = {}
      ) => {
        const segments = path.split("/");
        const replacedPath = segments
          .map((segment) => {
            if (!segment.startsWith(":")) return segment;
            const v = params?.[segment.slice(1)];
            if (v === undefined) {
              throw new Error("Missing parameter " + segment);
            }
            return v;
          })
          .join("/");

        return f.fetch(`${base}${replacedPath}`, {
          method,
          body: value ? JSON.stringify(value) : undefined,
          headers: value
            ? { ...init.headers, "Content-Type": "application/json" }
            : init.headers,
          ...init,
        });
      };

      return fetch_;
    },
  };

  return new Proxy({} as FetcherRouter<ROUTES>, handler);
};

type FetcherGeneric = (
  url: `/${string}`,
  init?: RequestInit
) => Promise<Response> | Response;

type FetcherRouter<ROUTES> = ROUTES & { fetch: FetcherGeneric };

// type X =  (
//   url: NonOverlappingPattern<
//     METHOD,
//     PATTERN,
//     ROUTES
//   > extends typeof NEW_PATTERN
//     ? StringifyPattern<PATTERN, string>
//     : never,
//   init?: RequestInit
// ): RouteBuilder<REST_ARGS, ROUTES | Record<METHOD, { pattern: PATTERN }>>;
