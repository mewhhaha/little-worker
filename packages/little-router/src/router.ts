import {
  TextResponse,
  JSONResponse,
  BodyResponse,
} from "@mewhhaha/typed-response";
import { JSONOf, JSONString } from "@mewhhaha/json-string";
import { match } from "./match";
import { HasOverlap } from "./overlap";

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

      return (pattern: string, h: RouteHandler<string, Request, REST_ARGS>) => {
        const patternSegments = pattern.split("/");
        const route: Route<REST_ARGS> = async (segments, request, rest) => {
          if (property !== "all" && request.method.toLowerCase() !== property) {
            return null;
          }

          const params = match(segments, patternSegments);
          if (params === null) {
            return null;
          }

          return h({ request, params, url: new URL(request.url) }, ...rest);
        };
        routes.push(route);
        return proxy;
      };
    },
  };

  return new Proxy({} as any, handler);
};

export type Accept<TEXT extends string> = RouteHandler<
  any,
  TextRequest<TEXT>,
  any,
  any
>;

export type AcceptJSON<OBJ> = RouteHandler<
  any,
  JSONRequest<JSONString<OBJ>>,
  any,
  any
>;

export type RoutesOf<T> = T extends RouteBuilder<any, infer ROUTES>
  ? ROUTES
  : never;

interface TextRequest<TEXT extends string> extends Request {
  text(): Promise<TEXT>;
  json(): Promise<unknown>;
}

interface JSONRequest<TEXT extends JSONString<any>> extends Request {
  text(): Promise<TEXT>;
  json(): Promise<JSONOf<TEXT>>;
}

type RouteProxy<
  METHOD extends Method,
  ROUTES extends RouteStore,
  REST_ARGS extends unknown[]
> = <
  PATTERN extends string,
  RESPONSE extends AnyResponse,
  TEXT extends string = never
>(
  pattern: Extract<ROUTES, { method: METHOD }> extends never
    ? PATTERN
    : HasOverlap<
        PATTERN,
        Extract<ROUTES, { method: METHOD }>["pattern"]
      > extends false
    ? PATTERN
    : ValidationError<"Overlapping route pattern">,
  h: RouteHandler<
    PATTERN,
    METHOD extends "get"
      ? Request
      : TEXT extends never
      ? Request
      : TEXT extends JSONString<any>
      ? JSONRequest<TEXT>
      : TextRequest<TEXT>,
    REST_ARGS,
    RESPONSE
  >
) => RouteBuilder<
  REST_ARGS,
  | ROUTES
  | {
      method: METHOD;
      pattern: PATTERN;
      response: RESPONSE;
      body: METHOD extends "get" ? never : TEXT;
    }
>;

type AnyResponse =
  | TextResponse<any, any>
  | BodyResponse<any>
  | JSONResponse<any, any>
  | Response;

type RouteHandler<
  PATTERN extends string,
  REQUEST extends Request,
  REST_ARGS extends unknown[],
  RESPONSE extends AnyResponse = Response
> = (
  context: {
    request: REQUEST;
    params: PatternParamsObject<PATTERN>;
    url: URL;
  },
  ...rest: REST_ARGS
) => Promise<RESPONSE> | RESPONSE;

type Method = "get" | "post" | "put" | "delete" | "patch" | "all";

type Route<REST_ARGS extends unknown[]> = (
  segments: string[],
  request: TextRequest<any> | Request,
  rest: REST_ARGS
) => Promise<Response | null>;

type RouteStore = {
  method: string;
  pattern: string;
  body: string;
  response: AnyResponse;
};

type RouteBuilder<REST_ARGS extends unknown[], ROUTES extends RouteStore> = {
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
