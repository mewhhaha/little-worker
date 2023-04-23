import {
  TextResponse,
  JSONResponse,
  BodyResponse,
} from "@mewhhaha/typed-response";
import { JSONString } from "@mewhhaha/json-string";
import { match } from "./match.js";
import { HasOverlap } from "./overlap.js";

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

          return h({ params, url: new URL(request.url) }, request, ...rest);
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

export interface TextRequest<TEXT extends string> extends Request {
  text(): Promise<TEXT>;
  json(): Promise<unknown>;
}

export interface JSONRequest<OBJ> extends Request {
  headers: Headers & { "Content-Type": "application/json" };
  text(): Promise<JSONString<OBJ>>;
  json(): Promise<unknown>;
}

export interface JSONThrowableRequest<OBJ, RESPONSES extends Response>
  extends JSONRequest<OBJ> {
  readonly __throwable: RESPONSES;
}

type RouteProxy<
  METHOD extends Method,
  ROUTES extends RouteDefinition,
  REST_ARGS extends unknown[]
> = <
  const REQUEST extends Request,
  const PATTERN extends string,
  const RESPONSE extends AnyResponse
>(
  pattern: Extract<ROUTES, { method: METHOD }> extends never
    ? PATTERN
    : HasOverlap<
        PATTERN,
        Extract<ROUTES, { method: METHOD }>["pattern"]
      > extends false
    ? PATTERN
    : ValidationError<"Overlapping route pattern">,
  h: RouteHandler<PATTERN, REQUEST, REST_ARGS, RESPONSE>
) => RouteBuilder<
  REST_ARGS,
  | ROUTES
  | RouteDefinition<
      METHOD,
      PATTERN,
      REQUEST extends JSONRequest<infer I>
        ? JSONString<I>
        : REQUEST extends TextRequest<infer I>
        ? I
        : never,
      | RESPONSE
      | (REQUEST extends JSONThrowableRequest<any, infer E> ? E : never)
    >
>;

type AnyResponse =
  | TextResponse<any, any>
  | BodyResponse<any>
  | JSONResponse<any, any>
  | Response;

const UNUSED = Symbol();

type RouteHandler<
  PATTERN extends string,
  REQUEST extends Request,
  REST_ARGS extends unknown[] = [],
  RESPONSE extends AnyResponse = Response
> = (
  context: {
    params: PatternParamsObject<PATTERN>;
    url: URL;
  },
  request: REQUEST,
  ...rest: REST_ARGS
) => Promise<RESPONSE> | RESPONSE;

type Method = "get" | "post" | "put" | "delete" | "patch" | "all";

type Route<REST_ARGS extends unknown[]> = (
  segments: string[],
  request: Request,
  rest: REST_ARGS
) => Promise<Response | null>;

type RouteDefinition<
  METHOD = string,
  PATTERN = string,
  BODY = string,
  RESPONSE = AnyResponse
> = {
  method: METHOD;
  pattern: PATTERN;
  body: BODY;
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
