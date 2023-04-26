import {
  BodyResponse,
  JSONResponse,
  TextResponse,
} from "@mewhhaha/typed-response";

export type AnyResponse =
  | TextResponse<any, any>
  | BodyResponse<any>
  | JSONResponse<any, any>
  | Response;
