import { error } from "@mewhhaha/typed-response";
import { Plugin } from "@mewhhaha/little-router";
import { Infer, Type } from "arktype";
import { JSONString } from "@mewhhaha/json-string";

export interface JSONRequest<T> extends Request {
  __init: {
    headers: { "Content-Type": "application/json" };
    body: JSONString<T>;
  };
}

export const data_ = <T>(parser: Type<T>) =>
  (async (request: JSONRequest<T>) => {
    try {
      const r = parser(await request.json());
      if (r.problems) {
        return error(422, r.problems.summary);
      }

      return { data: r.data as T };
    } catch (err) {
      if (err instanceof Error) {
        return error(400, err.message);
      }
      return error(400, null);
    }
  }) satisfies Plugin;
