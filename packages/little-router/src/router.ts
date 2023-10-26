import { match } from "./match.js";
import { GetOverlap, HasOverlap } from "./overlap.js";
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
      // [method, pattern, plugins, h]
      for (const [method, pattern, plugins, h] of routes) {
        if (request.method !== method && method !== "ALL") {
          continue;
        }

        const params = match(segments, pattern);
        if (params == null) {
          continue;
        }

        const pctx = { url, request, params };
        const ctx =
          plugins.length > 0 ? await context(pctx, plugins, rest) : pctx;
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

  const r: Record<string, any> = { handle };

  const adder = <METHOD extends Method>(method: METHOD) => {
    return (
      stringPattern: string,
      plugins: Plugin[],
      h: RouteHandler<RouteHandlerContext<any>, REST_ARGS>
    ) => {
      const pattern = stringPattern.split("/");
      routes.push([method.toUpperCase(), pattern, plugins, h]);
      return r;
    };
  };

  for (const method of [
    "get",
    "post",
    "put",
    "delete",
    "options",
    "patch",
    "all",
  ] satisfies Method[]) {
    r[method] = adder(method);
  }

  return r as any;
};

const context = async <REST_ARGS extends unknown[]>(
  pctx: {
    params: Record<string, string>;
    url: URL;
    request: Request;
  },
  plugins: Plugin<REST_ARGS>[],
  rest: REST_ARGS
) => {
  const results = await Promise.all(
    plugins.map((p) => p(pctx, ...(rest as any)))
  );

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

export type RoutesOf<T> = T extends RouteBuilder<
  any,
  infer ROUTES extends FetchDefinition
>
  ? ROUTES
  : never;

type StartsWithSlash<T extends string> = T extends `/${string}` ? T : never;

type RouteProxy<
  METHOD extends Method,
  ROUTES extends FetchDefinition,
  REST_ARGS extends unknown[],
> = <
  const PATTERN extends string,
  const RESPONSE extends Response,
  PLUGINS extends Plugin<REST_ARGS>[],
>(
  pattern: Extract<ROUTES, { method: METHOD | "all" }> extends never
    ? StartsWithSlash<PATTERN>
    : HasOverlap<
        PATTERN,
        Extract<ROUTES, { method: METHOD | "all" }>["pattern"]
      > extends false
    ? StartsWithSlash<PATTERN>
    : ValidationError<`${PATTERN} will never match because of preceding pattern ${GetOverlap<
        PATTERN,
        Extract<ROUTES, { method: METHOD | "all" }>["pattern"]
      >}`>,
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

type SearchOf<PLUGINS extends Plugin<any>[]> = PLUGINS extends ((
  context: PluginContext<{
    init: any;
    search: infer I extends Queries | undefined;
  }>,
  ...rest: any[]
) => any)[]
  ? NonNullable<I>
  : never;

type InitOf<PLUGINS extends Plugin<any>[]> = PLUGINS extends ((
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
  REST_ARGS extends unknown[],
  RESPONSE extends Response = Response,
> = (
  context: UnionToIntersection<CONTEXT>,
  ...rest: REST_ARGS
) => Promise<RESPONSE> | RESPONSE;

type RouteHandlerContext<PATTERN extends string> = {
  params: PatternParamsObject<PATTERN>;
  url: URL;
  request: Request;
};

export type Method =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "all";

export type Route<REST_ARGS extends unknown[]> = [
  method: string,
  segments: string[],
  plugins: Plugin<REST_ARGS>[],
  route: RouteHandler<Record<string, any>, REST_ARGS>,
];

export type RouteBuilder<
  REST_ARGS extends unknown[],
  ROUTES extends FetchDefinition,
> = {
  [METHOD in Method]: RouteProxy<METHOD, ROUTES, REST_ARGS>;
} & {
  handle: (
    request: Request,
    ...rest: REST_ARGS
  ) => Promise<Response> | Response;
  /** Not an actual value, just an easy way to expose the types to do `typeof router.infer` */
  infer: ROUTES;
};

export type PatternParams<PATTERN> =
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

/**
 * Used to to type all the `route` functions with correct arguments. There's one prop that can be defined which is "arguments".
 *
 * @example
 * declare module "@mewhhaha/little-router" {
 *  interface RouteData {
 *    arguments: [Env, ExecutionContext];
 *  }
 * }
 */
export interface RouteData {
  [key: string]: unknown;
}

// Helper for generating routes
export const route = <
  const PATTERN extends string,
  const RESPONSE extends Response,
  PLUGINS extends Plugin<
    ROUTE_ARGS["arguments"] extends unknown[] ? ROUTE_ARGS["arguments"] : []
  >[],
  ROUTE_ARGS extends RouteData = RouteData,
>(
  pattern: StartsWithSlash<PATTERN>,
  plugins: PLUGINS,
  h: RouteHandler<
    | RouteHandlerContext<PATTERN>
    | Exclude<Awaited<ReturnType<PLUGINS[number]>>, Response>,
    ROUTE_ARGS["arguments"] extends unknown[] ? ROUTE_ARGS["arguments"] : [],
    RESPONSE
  >
): [
  StartsWithSlash<PATTERN>,
  PLUGINS,
  RouteHandler<
    | RouteHandlerContext<PATTERN>
    | Exclude<Awaited<ReturnType<PLUGINS[number]>>, Response>,
    ROUTE_ARGS["arguments"] extends unknown[] ? ROUTE_ARGS["arguments"] : [],
    RESPONSE
  >,
] => [pattern, plugins, h];
