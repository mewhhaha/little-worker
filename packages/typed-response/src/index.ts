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

export interface TextResponse<CODE extends HttpStatusXXX, TEXT extends string>
  extends Response {
  text(): Promise<TEXT>;
  json(): Promise<unknown>;
  json<T = unknown>(): Promise<T>;
  status: CODE;
  ok: Ok<CODE>;
}

export interface JSONResponse<CODE extends HttpStatusXXX, JSON>
  extends Response {
  json(): Promise<JSON>;
  json<T = JSON>(): Promise<T>;
  status: CODE;
  ok: Ok<CODE>;
}

export interface BodyResponse<CODE extends HttpStatusXXX> extends Response {
  json(): Promise<unknown>;
  json<T = unknown>(): Promise<T>;
  status: CODE;
  ok: Ok<CODE>;
}

/**
 * Helper for returning a json response.
 * @example
 * return json(200, null)
 */
export const json = <const CODE extends HttpStatusXXX, const JSON>(
  code: CODE,
  value: JSON,
  init?: Omit<ResponseInit, "status">
) =>
  new Response(JSON.stringify(value), {
    ...init,
    status: code,
    headers: { ...init?.headers, "Content-Type": "application/json" },
  }) as JSONResponse<CODE, JSON>;

/**
 * Helper for returning a text response.
 * @example
 * return text(200, "ok")
 */
export const text = <
  const CODE extends HttpStatusXXX,
  const TEXT extends string
>(
  code: CODE,
  value: TEXT,
  init?: Omit<ResponseInit, "status">
) =>
  new Response(value, {
    ...init,
    status: code,
  }) as TextResponse<CODE, TEXT>;

/**
 * Helper for returning an error response with JSON body.
 * @example
 * return body(101, null, { webSocket: socket })
 */
export const body = <const CODE extends HttpStatusXXX>(
  code: CODE,
  value?: BodyInit | null,
  init?: Omit<ResponseInit, "status">
) =>
  new Response(value, {
    ...init,
    status: code,
  }) as BodyResponse<CODE>;

/**
 * Helper for returning any typed response.
 * @example
 * return error(403, { message: "You shall not pass" })
 */
export const error = <
  const CODE extends HttpStatus4XX | HttpStatus5XX,
  const JSON = null
>(
  code: CODE,
  value?: JSON,
  init?: Omit<ResponseInit, "status">
) => json(code, value ?? null, init) as JSONResponse<CODE, JSON>;

/**
 * Helper for returning a 2XX response with JSON body.
 * @example
 * return ok(200, { value: "ok"})
 */
export const ok = <
  const CODE extends Exclude<HttpStatus2XX, 204 | 205>,
  const JSON = null
>(
  code: CODE,
  value?: JSON,
  init?: Omit<ResponseInit, "status">
): JSONResponse<CODE, JSON> =>
  json(code, value ?? null, init) as JSONResponse<CODE, JSON>;

export const empty = <const CODE extends 101 | 204 | 205 | 304>(
  code: CODE,
  init?: Omit<ResponseInit, "status">
): TextResponse<CODE, ""> => text(code, "", init);
