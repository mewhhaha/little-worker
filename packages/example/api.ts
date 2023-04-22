import { JSONString } from "@mewhhaha/generics-stringify";
import { TextResponse, JSONResponse } from "@mewhhaha/typed-response";
import {
  GetRequestInit,
  PostRequestInit,
  SearchString,
} from "@mewhhaha/typed-request";

declare global {
  function fetch(
    url: "http://localhost:4545/example-get",
    init?: GetRequestInit
  ): Promise<TextResponse<200, "Hello fetch!">>;

  function fetch(
    url: "http://localhost:4545/example-post",
    init: PostRequestInit & {
      body: JSONString<{ value: "world" }>;
      headers: { "Content-Type": "application/json" };
    }
  ): Promise<JSONResponse<200, { hello: "world" }>>;

  function fetch(
    url: "http://localhost:4545/example-advanced",
    init: PostRequestInit & {
      body: JSONString<{ value: "world" | "no" }>;
      headers: { "Content-Type": "application/json" };
    }
  ): Promise<
    JSONResponse<200, { hello: "world" }> | TextResponse<422, "no no no">
  >;

  function fetch<
    S extends string,
    Q extends `sort=${"asc" | "desc"}` | `size=${number}`
  >(
    url: `http://localhost:4545/example-search-params${SearchString<S, Q>}`,
    init?: GetRequestInit
  ): Promise<
    JSONResponse<
      200,
      { [KEY in keyof SearchParamsObject<S>]: SearchParamsObject<S>[KEY] }
    >
  >;
}

type SearchParamsObject<STRING> = STRING extends `?${infer REST}`
  ? SearchParamsObject<REST>
  : STRING extends `${infer NAME}=${infer VALUE}&${infer REST}`
  ? Record<NAME, VALUE> & SearchParamsObject<REST>
  : STRING extends `${infer NAME}=${infer VALUE}`
  ? Record<NAME, VALUE>
  : Record<string, never>;
