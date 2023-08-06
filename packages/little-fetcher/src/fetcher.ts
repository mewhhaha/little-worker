import { RequestMethod } from "@mewhhaha/typed-request";
import { FetchDefinition, Queries } from "@mewhhaha/little-router";
import { QueryParams, ValidPath } from "./valid-path.js";

type FetcherOptions = {
  base?: string;
};

type Method = Lowercase<RequestMethod>;

export const fetcher = <ROUTES extends FetchDefinition>(
  stub:
    | {
        fetch: (
          url: string,
          init?: Parameters<typeof fetch>[1]
        ) => ReturnType<typeof fetch>;
      }
    | "fetch",
  { base = "http://from.fetcher" }: FetcherOptions = {}
): FetcherOf<ROUTES> => {
  const f =
    stub === "fetch"
      ? { fetch: (...args: Parameters<typeof fetch>) => fetch(...args) }
      : stub;

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

type FetcherFunction<T extends FetchDefinition> = <PATH extends string>(
  ...args: NarrowMatch<
    T extends {
      pattern: infer PATTERN extends string;
      search: infer SEARCH extends Queries;
      init: infer INIT extends RequestInit | undefined;
    }
      ? {
          valid: ValidPath<PATH, PATTERN, SEARCH>;

          args: [
            url: ValidPath<PATH, PATTERN, SEARCH> extends true
              ? PATH
              : `${PATTERN}${`?${QueryParams<SEARCH>}` | ""}`,
            ...init: undefined extends INIT
              ? [
                  init?: UndefinedToOptional<NonNullable<INIT>> &
                    Omit<RequestInit, "method" | keyof INIT>,
                ]
              : [
                  init: UndefinedToOptional<NonNullable<INIT>> &
                    Omit<RequestInit, "method" | keyof INIT>,
                ],
          ];
        }
      : []
  >
) => T extends {
  pattern: infer PATTERN extends string;
  search: infer SEARCH extends Queries;
  response: infer RESPONSE extends Response;
}
  ? ValidPath<PATH, PATTERN, SEARCH> extends true
    ? Promise<RESPONSE>
    : never
  : never;

type NarrowMatch<
  T extends { valid: true | false; args: [url: string, ...args: any] },
> = Extract<T, { valid: true }> extends never
  ? T["args"]
  : Extract<T, { valid: true }>["args"];

type FetcherFunctionAny = (
  url: `/${string}`,
  init?: RequestInit
) => Promise<Response>;

type FetcherOf<ROUTES extends FetchDefinition> = {
  [METHOD in Extract<Lowercase<ROUTES["method"]>, Method>]: FetcherFunction<
    Extract<ROUTES, { method: METHOD }>
  >;
} & {
  fetch: FetcherFunctionAny;
};

type UndefinedToOptional<T extends Record<string, any>> = keyof T extends any
  ? undefined extends T[keyof T]
    ? { [KEY in keyof T]?: T[KEY] }
    : { [KEY in keyof T]: T[KEY] }
  : never;
