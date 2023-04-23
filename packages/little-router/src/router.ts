import {
  TextResponse,
  JSONResponse,
  BodyResponse,
} from "@mewhhaha/typed-response";
import { match } from "./match.js";
import { HasOverlap } from "./overlap.js";

const EMPTY = [];

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
    for (const route of routes) {
      try {
        const response = await route(segments, request, rest);
        if (response !== null) {
          return response;
        }
      } catch (err) {
        if (err instanceof Response) return err;
        if (err instanceof Error)
          return new Response(err.message, { status: 500 });
        return new Response(null, { status: 500 });
      }
    }

    return new Response(null, { status: 500 });
  };

  const handler: ProxyHandler<RouteBuilder<REST_ARGS, never>> = {
    get: <METHOD extends Method>(
      _: unknown,
      property: METHOD | "handle",
      proxy: ReturnType<typeof Router>
    ) => {
      if (property === "handle") {
        return handle;
      }

      return (
        pattern: string,
        plugins: Plugin[],
        h: RouteHandler<RouteHandlerContext<any>, REST_ARGS>
      ) => {
        const patternSegments = pattern.split("/");
        const route: Route<REST_ARGS> = async (segments, request, rest) => {
          if (property !== "all" && request.method.toLowerCase() !== property) {
            return null;
          }

          const params = match(segments, patternSegments);
          if (params === null) {
            return null;
          }

          const context = { params, url: new URL(request.url), request };

          for (const plugin of plugins) {
            const result = await plugin(request);
            if (result instanceof Response) return result;
            Object.assign(context, result);
          }

          return h(context, ...rest);
        };
        routes.push(route);
        return proxy;
      };
    },
  };

  return new Proxy({} as any, handler);
};

export type RoutesOf<T> = T extends RouteBuilder<any, infer ROUTES>
  ? ROUTES
  : never;

export interface FormRequest extends Request {
  formData(): Promise<FormData>;
  text(): Promise<string>;
  json(): Promise<never>;
}

export interface BodyRequest<CONTENT extends string> extends Request {
  text(): Promise<CONTENT>;
  json(): Promise<unknown>;
}

export type Plugin = (
  request: any
) => Promise<Record<string, any> | AnyResponse>;

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
      RequestBody<Parameters<PLUGINS[number]>[0]>,
      RequestHeaders<Parameters<PLUGINS[number]>[0]>,
      RESPONSE | Extract<Awaited<ReturnType<PLUGINS[number]>>, Response>
    >
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type RequestBody<T extends Request> = T extends {
  __init: { body: infer B extends BodyInit };
}
  ? B
  : never;

type RequestHeaders<T extends Request> = T extends {
  __init: { headers: infer B extends Record<string, string> };
}
  ? B
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

type Route<REST_ARGS extends unknown[]> = (
  segments: string[],
  request: Request,
  rest: REST_ARGS
) => Promise<Response | null>;

type RouteDefinition<
  METHOD extends string = string,
  PATTERN extends string = string,
  BODY extends BodyInit = BodyInit,
  HEADERS extends Record<string, string> = Record<string, string>,
  RESPONSE extends AnyResponse = AnyResponse
> = {
  method: METHOD;
  pattern: PATTERN;
  body: BODY;
  response: RESPONSE;
  headers: HEADERS;
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
