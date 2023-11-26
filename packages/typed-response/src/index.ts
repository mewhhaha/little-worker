export type HttpStatus1XX = 100 | 101 | 102 | 103;

export type HttpStatus2XX =
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 226;

export type HttpStatus3XX = 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;
export type HttpStatus4XX =
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 428
  | 429
  | 431
  | 451;

export type HttpStatus5XX =
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 510
  | 511;

export type HttpStatusXXX =
  | HttpStatus1XX
  | HttpStatus2XX
  | HttpStatus3XX
  | HttpStatus4XX
  | HttpStatus5XX;

export type Ok<CODE extends number> = number extends CODE
  ? boolean
  : Exclude<CODE, HttpStatus2XX> extends never
    ? true
    : false;

export type MergedHeaders<
  ORIGINAL,
  INCOMING extends Record<string, string>,
> = Record<string, string> extends FromHeaders<ORIGINAL>
  ? INCOMING
  : FromHeaders<ORIGINAL> & INCOMING;

export type FromHeaders<ORIGINAL> = ORIGINAL extends Headers
  ? Record<string, string>
  : ORIGINAL extends TypedHeaders<infer HEADERS>
    ? HEADERS
    : ORIGINAL extends [string, string][]
      ? FromEntries<ORIGINAL>
      : ORIGINAL;

export type FromEntries<T extends [string, string][]> = {
  [P in T[number][0]]: Extract<T[number], [P, string]>[1];
};

export type TypedHeaders<DEFINED_HEADERS extends Record<string, string>> = Omit<
  Headers,
  "get"
> & {
  get<T extends keyof DEFINED_HEADERS>(key: T): DEFINED_HEADERS[T];
  get(key: string): string | null;
};

export interface TextResponse<
  CODE extends HttpStatusXXX,
  TEXT extends string,
  HEADERS extends { "Content-Type": `text/${string}` } = {
    "Content-Type": `text/${string}`;
  },
> extends Response {
  text(): Promise<TEXT>;
  json(): Promise<never>;
  json<T = never>(): Promise<T>;
  status: CODE;
  ok: Ok<CODE>;
  headers: TypedHeaders<HEADERS>;
}

export interface JSONResponse<
  CODE extends HttpStatusXXX,
  JSON,
  HEADERS extends { "Content-Type": "application/json" } = {
    "Content-Type": "application/json";
  },
> extends Response {
  json(): Promise<JSON>;
  json<T = JSON>(): Promise<T>;
  status: CODE;
  ok: Ok<CODE>;
  headers: TypedHeaders<HEADERS>;
}

export interface BodyResponse<
  CODE extends HttpStatusXXX,
  HEADERS extends Record<string, string> = Record<never, never>,
> extends Response {
  json(): Promise<unknown>;
  json<T = unknown>(): Promise<T>;
  status: CODE;
  ok: Ok<CODE>;
  headers: TypedHeaders<HEADERS>;
}

/**
 * Helper for returning a json response.
 * @example
 * return json(200, null)
 */
export const json = <
  const CODE extends HttpStatusXXX,
  const JSON,
  const HEADERS extends TypedHeadersInit = TypedHeadersInit,
>(
  code: CODE,
  value: JSON,
  init?: Omit<ResponseInit, "status" | "headers"> & { headers?: HEADERS }
) =>
  new Response(JSON.stringify(value), {
    ...init,
    status: code,
    headers: mergeHeaders(init?.headers, {
      "Content-Type": "application/json",
    }),
  }) as JSONResponse<
    CODE,
    JSON,
    MergedHeaders<HEADERS, { "Content-Type": "application/json" }>
  >;

/**
 * Helper for returning a text response.
 * @example
 * return text(200, "ok")
 */
export const text = <
  const CODE extends HttpStatusXXX,
  const TEXT extends string,
  const HEADERS extends TypedHeadersInit = TypedHeadersInit,
>(
  code: CODE,
  value: TEXT,
  init?: Omit<ResponseInit, "status" | "header"> & { headers?: HEADERS }
) =>
  new Response(value, {
    ...init,
    status: code,
    headers: mergeHeaders(init?.headers, { "Content-Type": "text/plain" }),
  }) as TextResponse<
    CODE,
    TEXT,
    MergedHeaders<HEADERS, { "Content-Type": "text/plain" }>
  >;

/**
 * Helper for returning an html response.
 * @example
 * return html(200, "<html></html>")
 */
export const html = <
  const CODE extends HttpStatusXXX,
  const TEXT extends string,
  const HEADERS extends TypedHeadersInit = TypedHeadersInit,
>(
  code: CODE,
  value: TEXT,
  init?: Omit<ResponseInit, "status">
) =>
  new Response(value, {
    ...init,
    status: code,
    headers: mergeHeaders(init?.headers, { "Content-Type": "text/html" }),
  }) as TextResponse<
    CODE,
    TEXT,
    MergedHeaders<HEADERS, { "Content-Type": "text/html" }>
  >;

/**
 * Helper for returning a normal body response
 * @example
 * return body(101, null, { webSocket: socket })
 */
export const body = <
  const CODE extends HttpStatusXXX,
  HEADERS extends TypedHeadersInit = TypedHeadersInit,
>(
  code: CODE,
  value?: BodyInit | null,
  init?: Omit<ResponseInit, "status" | "headers"> & { headers?: HEADERS }
) =>
  new Response(value, {
    ...init,
    status: code,
  }) as BodyResponse<CODE, MergedHeaders<HEADERS, Record<never, never>>>;

/**
 * Helper for returning an error response with JSON body.
 * @example
 * return err(403, { message: "You shall not pass" })
 */
export const err = <
  const CODE extends HttpStatus4XX | HttpStatus5XX,
  const JSON = null,
  const HEADERS extends TypedHeadersInit = TypedHeadersInit,
>(
  code: CODE,
  value?: JSON,
  init?: Omit<ResponseInit, "status" | "headers"> & { headers?: HEADERS }
) =>
  json(code, value ?? null, init) as JSONResponse<
    CODE,
    JSON,
    MergedHeaders<HEADERS, { "Content-Type": "application/json" }>
  >;

/**
 * Helper for returning a 2XX response with JSON body.
 * Special cases for 204 and 205 which won't be JSON responses and won't return a body.
 * @example
 * return ok(200, { value: "ok"})
 */
export const ok = <
  const CODE extends HttpStatus2XX,
  const JSON extends CODE extends 204 | 205 ? null : unknown = null,
  const HEADERS extends TypedHeadersInit = TypedHeadersInit,
>(
  // We enforce single values as to avoid anyone passing 200 | 204 and expecting the wrong response
  code: IsSingleValue<CODE>,
  value?: JSON,
  init?: Omit<ResponseInit, "status" | "headers"> & { headers?: HEADERS }
): Extract<typeof code, 204 | 205> extends never
  ? JSONResponse<
      CODE,
      JSON,
      MergedHeaders<HEADERS, { "Content-Type": "application/json" }>
    >
  : TextResponse<
      CODE,
      "",
      MergedHeaders<HEADERS, { "Content-Type": "text/plain" }>
    > => {
  if (code === 204 || code === 205) {
    // @ts-expect-error This is correct, but can't validate it with narrowed typing
    return text(code, "", init);
  }
  // @ts-expect-error This is correct, but can't validate it with narrowed typing
  return json(code, value ?? null, init);
};

export const empty = <
  const CODE extends 101 | 204 | 205 | 304,
  HEADERS extends TypedHeadersInit = TypedHeadersInit,
>(
  code: CODE,
  init?: Omit<ResponseInit, "status" | "headers"> & { headers?: HEADERS }
): BodyResponse<CODE, MergedHeaders<HEADERS, Record<never, never>>> =>
  body(code, null, init);

type IsUnion<T, U = T> = T extends any ? (U extends T ? false : true) : false;
type IsSingleValue<T> = true extends IsUnion<T> ? never : T;

export const mergeHeaders = (
  init: TypedHeadersInit | undefined,
  incoming: Record<string, string>
) => {
  const merged = new Headers(init);

  for (const key in incoming) {
    const value = incoming[key];
    merged.append(key, value);
  }
  return merged;
};

type TypedHeadersInit =
  | Headers
  | [string, string][]
  | TypedHeaders<Record<string, string>>
  | Record<string, string>;
