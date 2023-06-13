import { match } from "./match.js";
import { HasOverlap } from "./overlap.js";
import { Plugin, PluginContext } from "./plugin.js";
import { FetchDefinition, Queries } from "./fetch.js";

/**
 * Returns an instance of RouteBuilder that you can use to build your routing
 * structure.
 *
 * @typeParam REST_ARGS - Used to type Env and ExecutionContext from cloudflare
 *                        workers. More info in [cloudflare workers docs]( https://developers.cloudflare.com/workers/platform/environment-variables/).
 *
 * The returned RouteBuilder can be build upon by using the method function,
 * with names corresponding to http request methods.
 *
 * {@link Method | Available Methods}
 *
 * @example
 * ```ts
 * type Env = {
 *   MY_ENV_VAR: string;
 *   MY_SECRET: string;
 *   myKVNamespace: KVNamespace;
 * };
 * const router = Router<Env, ExecutionContext>
 * ```
 *
 * More on cloudflare worker types in [their documentation](https://github.com/cloudflare/workerd/tree/main/npm/workers-types#using-bindings).
 */
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

const context = async <REST_ARGS extends unknown[]>(
  request: Request,
  url: URL,
  params: Record<string, string>,
  plugins: Plugin<REST_ARGS>[],
  rest: REST_ARGS
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
  REST_ARGS extends unknown[]
> = <
  const PATTERN extends string,
  const RESPONSE extends Response,
  PLUGINS extends Plugin<REST_ARGS>[]
>(
  pattern: Extract<ROUTES, { method: METHOD | "all" }> extends never
    ? StartsWithSlash<PATTERN>
    : HasOverlap<
        PATTERN,
        Extract<ROUTES, { method: METHOD | "all" }>["pattern"]
      > extends false
    ? StartsWithSlash<PATTERN>
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
  REST_ARGS extends unknown[] = [],
  RESPONSE extends Response = Response
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
  route: RouteHandler<Record<string, any>, REST_ARGS>
];

export type RouteBuilder<
  REST_ARGS extends unknown[],
  ROUTES extends FetchDefinition
> = {
  /**
   * @param route - The route to match for this http method handler
   * @param pluginArray  - A list of plugins to be applied to this route
   * @param handler  - A function to run when the path has been matched
   * @returns an instance of RouteBuilder
   */
  get: RouteProxy<"get", ROUTES, REST_ARGS>;
  /**
   * @param route - The route to match for this http method handler
   * @param pluginArray  - A list of plugins to be applied to this route
   * @param handler  - A function to run when the path has been matched
   * @returns an instance of RouteBuilder
   */
  post: RouteProxy<"post", ROUTES, REST_ARGS>;
  /**
   * @param route - The route to match for this http method handler
   * @param pluginArray  - A list of plugins to be applied to this route
   * @param handler  - A function to run when the path has been matched
   * @returns an instance of RouteBuilder
   */
  put: RouteProxy<"put", ROUTES, REST_ARGS>;
  /**
   * @param route - The route to match for this http method handler
   * @param pluginArray  - A list of plugins to be applied to this route
   * @param handler  - A function to run when the path has been matched
   * @returns an instance of RouteBuilder
   */
  delete: RouteProxy<"delete", ROUTES, REST_ARGS>;
  /**
   * @param route - The route to match for this http method handler
   * @param pluginArray  - A list of plugins to be applied to this route
   * @param handler  - A function to run when the path has been matched
   * @returns an instance of RouteBuilder
   */
  patch: RouteProxy<"patch", ROUTES, REST_ARGS>;
  /**
   * @param route - The route to match for this http method handler
   * @param pluginArray  - A list of plugins to be applied to this route
   * @param handler  - A function to run when the path has been matched
   * @returns an instance of RouteBuilder
   */
  options: RouteProxy<"options", ROUTES, REST_ARGS>;
  all: RouteProxy<"all", ROUTES, REST_ARGS>;
  handle: (
    request: Request,
    ...rest: REST_ARGS
  ) => Promise<Response> | Response;
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
