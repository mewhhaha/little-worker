import { match } from "./match.js";
import { HasOverlap } from "./overlap.js";
import { AnyResponse } from "./types.js";
import { Plugin, PluginContext } from "./plugin.js";
import { FetchDefinition, Queries } from "./fetch.js";

export const Router = <REST_ARGS extends unknown[] = []>(): RouteBuilder<
  REST_ARGS,
  never
> => {
  const routes: Route<REST_ARGS>[] = [];

  const handle: RouteBuilder<REST_ARGS, never>["handle"] = async (
    request,
    ...rest
  ) => {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    try {
      for (const [method, pattern, plugins, h] of routes) {
        if (request.method !== method && method !== "ALL") {
          continue;
        }

        const params = match(segments, pattern);
        if (params == null) {
          continue;
        }

        const ctx = await context(request, url, params, plugins, rest);
        if (ctx instanceof Response) return ctx;

        return await h(ctx, ...rest);
      }
    } catch (err) {
      if (err instanceof Response) {
        return err;
      }

      return new Response(err instanceof Error ? err.message : null, {
        status: 500,
      });
    }

    return new Response(null, { status: 500 });
  };

  const proxy: ProxyHandler<RouteBuilder<REST_ARGS, never>> = {
    get: <METHOD extends Method>(
      _: unknown,
      method: METHOD,
      receiver: ReturnType<typeof Router>
    ) => {
      return (
        stringPattern: string,
        plugins: Plugin[],
        h: RouteHandler<RouteHandlerContext<any>, REST_ARGS>
      ) => {
        const pattern = stringPattern.split("/");
        routes.push([method.toUpperCase(), pattern, plugins, h]);
        return receiver;
      };
    },
  };

  return { __proto__: new Proxy({} as any, proxy), handle } as any;
};

const context = async (
  request: Request,
  url: URL,
  params: Record<string, string>,
  plugins: Plugin[],
  rest: unknown[]
) => {
  const pctx = { params, url, request };
  const results = await Promise.all(plugins.map((p) => p(pctx, ...rest)));

  const ctx: Record<string, any> = pctx;

  for (const result of results) {
    if (result instanceof Response) {
      return result;
    }

    for (const key in result) {
      const value = result[key as keyof typeof result];
      if (key in ctx) {
        throw new Error(
          `Plugin tried to overwrite context property ${key} with ${value}`
        );
      }
      ctx[key] = value;
    }
  }

  return ctx;
};

export type RoutesOf<T> = T extends RouteBuilder<any, infer ROUTES>
  ? ROUTES
  : never;

type RouteProxy<
  METHOD extends Method,
  ROUTES extends FetchDefinition,
  REST_ARGS extends unknown[]
> = <
  const PATTERN extends string,
  const RESPONSE extends AnyResponse,
  PLUGINS extends Plugin[]
>(
  pattern: Extract<ROUTES, { method: METHOD }> extends never
    ? PATTERN
    : HasOverlap<
        PATTERN,
        Extract<ROUTES, { method: METHOD }>["pattern"]
      > extends false
    ? PATTERN
    : ValidationError<"Overlapping route pattern">,
  plugins: PLUGINS,
  h: RouteHandler<
    | RouteHandlerContext<PATTERN>
    | Exclude<Awaited<ReturnType<PLUGINS[number]>>, Response>,
    REST_ARGS,
    RESPONSE
  >
) => RouteBuilder<
  REST_ARGS,
  | ROUTES
  | FetchDefinition<
      METHOD,
      PATTERN,
      SearchOf<PLUGINS>,
      InitOf<PLUGINS>,
      RESPONSE | Extract<Awaited<ReturnType<PLUGINS[number]>>, Response>
    >
>;

type SearchOf<PLUGINS extends Plugin[]> = PLUGINS extends ((
  context: PluginContext<{
    init: any;
    search: infer I extends Queries | undefined;
  }>,
  ...rest: any[]
) => any)[]
  ? NonNullable<I>
  : never;

type InitOf<PLUGINS extends Plugin[]> = PLUGINS extends ((
  context: PluginContext<{
    init: infer I extends RequestInit | undefined;
    search: any;
  }>,
  ...rest: any[]
) => any)[]
  ? I
  : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type RouteHandler<
  CONTEXT extends Record<string, any>,
  REST_ARGS extends unknown[] = [],
  RESPONSE extends AnyResponse = Response
> = (
  context: UnionToIntersection<CONTEXT>,
  ...rest: REST_ARGS
) => Promise<RESPONSE> | RESPONSE;

type RouteHandlerContext<PATTERN extends string> = {
  params: PatternParamsObject<PATTERN>;
  url: URL;
  request: Request;
};

type Method = "get" | "post" | "put" | "delete" | "patch" | "all";

type Route<REST_ARGS extends unknown[]> = [
  method: string,
  segments: string[],
  plugins: Plugin[],
  route: RouteHandler<Record<string, any>, REST_ARGS>
];

type RouteBuilder<
  REST_ARGS extends unknown[],
  ROUTES extends FetchDefinition
> = {
  [METHOD in Exclude<Method, "all">]: RouteProxy<METHOD, ROUTES, REST_ARGS>;
} & {
  handle: (
    request: Request,
    ...rest: REST_ARGS
  ) => Promise<Response> | Response;
};

type PatternParams<PATTERN> =
  PATTERN extends `${string}:${infer PARAM}/${infer REST}`
    ? PARAM | PatternParams<REST>
    : PATTERN extends `${string}:${infer PARAM}`
    ? PARAM
    : PATTERN extends `${string}*`
    ? "*"
    : never;

type PatternParamsObject<PATTERN extends string> = {
  [K in PatternParams<PATTERN>]: string;
};

type ValidationError<T extends string> = {
  __message: T;
  __error: never;
};
