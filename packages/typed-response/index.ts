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
  text: () => Promise<TEXT>;
  json: () => Promise<unknown>;
  status: CODE;
  ok: Ok<CODE>;
}

export interface JSONResponse<CODE extends HttpStatusXXX, JSON>
  extends Response {
  json: () => Promise<JSON>;
  status: CODE;
  ok: Ok<CODE>;
}

export interface BodyResponse<CODE extends HttpStatusXXX> extends Response {
  json: () => Promise<unknown>;
  status: CODE;
  ok: Ok<CODE>;
}
