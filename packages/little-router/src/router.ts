import { RequestMethod } from "@mewhhaha/typed-request";
import {
  TextResponse,
  JSONResponse,
  BodyResponse,
} from "@mewhhaha/typed-response";
import { body } from "@mewhhaha/typed-response-fns";
import { match } from "./match";
import { HasOverlap } from "./overlap";

export const Router = <REST_ARGS extends unknown[]>(): RouteBuilder<
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
        if (err instanceof Error) return body(500, err.message);
        return body(500, null);
      }
    }

    return body(500, null);
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

      return (pattern: string, h: RouteHandler<string, REST_ARGS>) => {
        const patternSegments = pattern.split("/");
        const route: Route<REST_ARGS> = async (segments, request, rest) => {
          if (property !== "all" && request.method.toLowerCase() !== property) {
            return null;
          }

          const params = match(segments, patternSegments);
          if (params === null) {
            return null;
          }

          return h({ request, params }, ...rest);
        };
        routes.push(route);
        return proxy;
      };
    },
  };

  return new Proxy({} as any, handler);
};

type RouteProxy<
  METHOD extends Method,
  ROUTES extends RouteStore,
  REST_ARGS extends unknown[]
> = <PATTERN extends string>(
  pattern: ROUTES[METHOD]["pattern"] extends never
    ? PATTERN
    : HasOverlap<PATTERN, ROUTES[METHOD]["pattern"]> extends false
    ? PATTERN
    : ValidationError<"Overlapping route pattern">,
  h: RouteHandler<PATTERN, REST_ARGS>
) => RouteBuilder<REST_ARGS, ROUTES | Record<METHOD, { pattern: PATTERN }>>;

type RouteHandlerContext<PATTERN extends string> = {
  request: Request;
  params: PatternParamsObject<PATTERN>;
};

type AnyResponse =
  | TextResponse<any, any>
  | BodyResponse<any>
  | JSONResponse<any, any>
  | Response;

type RouteHandler<PATTERN extends string, REST_ARGS extends unknown[]> = (
  { request, params }: RouteHandlerContext<PATTERN>,
  ...rest: REST_ARGS
) => Promise<AnyResponse> | AnyResponse;

type Method = Lowercase<RequestMethod> | "all";

type Route<REST_ARGS extends unknown[]> = (
  segments: string[],
  request: Request,
  rest: REST_ARGS
) => Promise<Response | null>;

type RouteStore = Record<string, { pattern: string }>;

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
    : never;

type PatternParamsObject<PATTERN extends string> = {
  [K in PatternParams<PATTERN>]: string;
};

type ValidationError<T extends string> = {
  __message: T;
  __error: never;
};
