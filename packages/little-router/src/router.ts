import {
  TextResponse,
  JSONResponse,
  BodyResponse,
} from "@mewhhaha/typed-response";
import { match } from "./match.js";
import { HasOverlap } from "./overlap.js";

export const Router = <REST_ARGS extends unknown[] = []>(): RouteBuilder<
  REST_ARGS,
  never
> => {
  const routes: RouteItem<REST_ARGS>[] = [];

  const handle: RouteBuilder<REST_ARGS, never>["handle"] = async (
    request,
    ...rest
  ) => {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    try {
      for (const [method, pattern, plugins, h] of routes) {
        if (request.method != method && method != "ALL") {
          continue;
        }

        const params = match(segments, pattern);
        if (params == null) {
          continue;
        }

        const context = { params, url, request };

        const results = await Promise.all(plugins.map((p) => p(request)));
        for (const result of results) {
          if (result instanceof Response) return result;
          Object.assign(context, result);
        }

        return await h(context, ...rest);
      }
    } catch (err) {
      if (err instanceof Response) return err;
      if (err instanceof Error) {
        return new Response(err.message, { status: 500 });
      }
      return new Response(null, { status: 500 });
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

export type RoutesOf<T> = T extends RouteBuilder<any, infer ROUTES>
  ? ROUTES
  : never;

/**
 * _INIT is for typing the expections of the RequestInit
 * */
export type Plugin<
  REQUEST extends Request = any,
  _INIT extends RequestInit = any
> = (
  request: REQUEST,
  init?: _INIT
) =>
  | Promise<Record<string, any> | AnyResponse>
  | Record<string, any>
  | AnyResponse;

type RouteProxy<
  METHOD extends Method,
  ROUTES extends RouteDefinition,
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
    | RouteHandlerContext<PATTERN, Parameters<PLUGINS[number]>[0]>
    | Exclude<Awaited<ReturnType<PLUGINS[number]>>, Response>,
    REST_ARGS,
    RESPONSE
  >
) => RouteBuilder<
  REST_ARGS,
  | ROUTES
  | RouteDefinition<
      METHOD,
      PATTERN,
      InitOf<PLUGINS>,
      RESPONSE | Extract<Awaited<ReturnType<PLUGINS[number]>>, Response>
    >
>;

type InitOf<PLUGINS extends Plugin[]> = PLUGINS extends Plugin<any, infer I>[]
  ? I
  : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type AnyResponse =
  | TextResponse<any, any>
  | BodyResponse<any>
  | JSONResponse<any, any>
  | Response;

type RouteHandler<
  CONTEXT extends Record<string, any>,
  REST_ARGS extends unknown[] = [],
  RESPONSE extends AnyResponse = Response
> = (
  context: UnionToIntersection<CONTEXT>,
  ...rest: REST_ARGS
) => Promise<RESPONSE> | RESPONSE;

type RouteHandlerContext<
  PATTERN extends string,
  REQUEST extends Request = Request
> = {
  params: PatternParamsObject<PATTERN>;
  url: URL;
  request: REQUEST;
};

type Method = "get" | "post" | "put" | "delete" | "patch" | "all";

type RouteItem<REST_ARGS extends unknown[]> = [
  method: string,
  segments: string[],
  plugins: Plugin[],
  route: RouteHandler<any, REST_ARGS>
];

type RouteDefinition<
  METHOD extends string = string,
  PATTERN extends string = string,
  INIT extends RequestInit = RequestInit,
  RESPONSE extends AnyResponse = AnyResponse
> = {
  method: METHOD;
  pattern: PATTERN;
  init: INIT;
  response: RESPONSE;
};

type RouteBuilder<
  REST_ARGS extends unknown[],
  ROUTES extends RouteDefinition
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
