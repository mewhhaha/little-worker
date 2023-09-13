import { type Plugin, type PluginContext } from "@mewhhaha/little-router";
import type { Type } from "arktype";
import type { JSONString } from "@mewhhaha/json-string";
import { error } from "@mewhhaha/typed-response";

type InOf<T> = T extends {
  inferIn: infer I extends
    | Record<any, any>
    | string
    | Array<any>
    | number
    | Date;
}
  ? I
  : never;

type OutOf<T> = T extends {
  infer: infer I;
}
  ? I
  : never;

export const data_ = <T extends Type<any>>(parser: T) =>
  (async ({
    request,
  }: PluginContext<{
    init: {
      headers: { "Content-Type": "application/json" } & Record<string, string>;
      body: JSONString<InOf<T>>;
    };
  }>) => {
    try {
      const r = parser(await request.json());
      if (r.problems) {
        return error(422, {
          message: "parsing was unsuccessful",
          summary: r.problems.summary,
        });
      }

      return { data: r.data as OutOf<T> };
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
      }
      return error(400, { message: "unknown error" });
    }
  }) satisfies Plugin;
