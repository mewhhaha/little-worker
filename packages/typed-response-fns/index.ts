import {
  JSONResponse,
  TextResponse,
  BodyResponse,
  HttpStatusXXX,
  HttpStatus4XX,
  HttpStatus5XX,
  HttpStatus2XX,
} from "@mewhhaha/typed-response";

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

export const body = <const CODE extends HttpStatusXXX>(
  code: CODE,
  value?: BodyInit | null,
  init?: Omit<ResponseInit, "status">
) =>
  new Response(value, {
    ...init,
    status: code,
  }) as BodyResponse<CODE>;

export const error = <
  const CODE extends HttpStatus4XX | HttpStatus5XX,
  const JSON = null
>(
  code: CODE,
  value?: JSON,
  init?: Omit<ResponseInit, "status">
) => json(code, value ?? null, init);

export const ok = <const CODE extends HttpStatus2XX, const JSON = null>(
  code: CODE,
  value?: JSON,
  init?: Omit<ResponseInit, "status">
) => json(code, value ?? null, init);
