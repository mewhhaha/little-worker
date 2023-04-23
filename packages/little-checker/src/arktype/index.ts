import { JSONResponse, error } from "@mewhhaha/typed-response";
import { JSONThrowableRequest } from "@mewhhaha/little-router";
import { Type } from "arktype";

type Throw = JSONResponse<422, string | null> | JSONResponse<400, null>;

export function check<T>(
  parser: Type<T>,
  request: JSONThrowableRequest<T, Throw>
): Promise<T>;

export function check<T>(
  parser: Type<T>,
  request?: undefined
): (request: JSONThrowableRequest<T, Throw>) => Promise<T>;

export function check<T>(
  ...args:
    | [parser: Type<T>, request: JSONThrowableRequest<T, Throw>]
    | [parser: Type<T>, request?: undefined]
): Promise<T> | ((request: JSONThrowableRequest<T, Throw>) => Promise<T>) {
  const f = async (request: JSONThrowableRequest<T, Throw>) => {
    try {
      const r = args[0](await request.json());
      if (r.problems) {
        throw error(422, r.problems.summary);
      }

      return r.data as T;
    } catch (err) {
      if (err instanceof Error) {
        throw error(400, err.message);
      }
      throw error(400, null);
    }
  };
  if (args[1] === undefined) {
    return f;
  }

  return f(args[1]);
}

export type RequestOf<T> = T extends (request: infer I) => Promise<any>
  ? I
  : never;
