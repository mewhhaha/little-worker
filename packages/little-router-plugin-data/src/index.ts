import { type Plugin, type PluginContext } from "@mewhhaha/little-router";
import { ArkErrors, type Type } from "arktype";
import type { JSONString } from "@mewhhaha/json-string";
import { err } from "@mewhhaha/typed-response";

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
      if (r instanceof ArkErrors) {
        return err(422, {
          message: "parsing_failed",
          summary: r.summary,
        });
      }

      return { data: r as OutOf<T> };
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      }
      return err(400, { message: "json_invalid" });
    }
  }) satisfies Plugin;
