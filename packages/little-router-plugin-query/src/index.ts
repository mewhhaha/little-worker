import {
  type Plugin,
  type PluginContext,
  type Queries,
} from "@mewhhaha/little-router";
import { error } from "@mewhhaha/typed-response";
import { type Type } from "arktype";

export type InOf<T> = T extends {
  inferIn: infer I extends Queries;
}
  ? I
  : never;

export type OutOf<T> = T extends {
  infer: infer I;
}
  ? I
  : never;

type SearchOptions = {
  /**
   * Default for array delimiter is "," */
  arrayDelimiter?: string;
};

/**
 * The input value for query has to be `Record<string, string | string[] | undefined>`.
 *
 * @example
 * ```tsx
 * query_(type({ foo: "'bar'" }))
 * query_(type({ foo: "'bar'[]" }))
 *
 * // This is invalid
 * query_(type({ foo: "number" }))
 * ```
 *
 * Search params are parsed as arrays if they end with [], with a default delimiter that is ",".
 *
 * ```
 * "?foo=bar" = { foo: "bar"}
 *
 * // This assumes default delimiter of ","
 * "?foo[]=bar,baz" = { foo: ["bar", "baz"] }
 * ```
 */
export const query_ = <T extends Type<any>>(
  parser: T,
  { arrayDelimiter = "," }: SearchOptions = {}
) =>
  (async ({
    url,
  }: PluginContext<{
    search?: InOf<T>;
  }>) => {
    const result: Record<string, string | string[] | undefined> = {};
    for (const key of new Set(url.searchParams.keys())) {
      const value = url.searchParams.get(key);
      if (value === null) continue;

      if (value.endsWith("[]")) {
        result[key] = value.split(arrayDelimiter);
      } else {
        result[key] = value;
      }
    }

    try {
      const r = parser(result);
      if (r.problems) {
        return error(422, {
          message: "parsing_failed",
          summary: r.problems.summary,
        });
      }

      return { query: r.data as OutOf<T> };
    } catch (err) {
      throw error(500, { message: "internal_error" });
    }
  }) satisfies Plugin;
