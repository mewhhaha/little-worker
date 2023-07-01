import {
  type Plugin,
  type PluginContext,
  type Queries,
} from "@mewhhaha/little-router";
import { error } from "@mewhhaha/typed-response";
import { type Type } from "arktype";

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

type SearchOptions = {
  /**
   * Default for array delimiter is "," */
  arrayDelimiter?: string;
};

/**
 * This parses either as a string or an array of strings if it ends with []
 * @example
 * ```
 * "?foo=bar" = { foo: "bar"}
 *
 * // This assumes default delimiter of ","
 * "?foo[]=bar,baz" = { foo: ["bar", "baz"] }
 * ```
 */
export const query_ = <T extends Type<any>>(
  parser: OutOf<T> extends Queries ? T : never,
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
        return error(422, r.problems.summary);
      }

      return { query: r.data as OutOf<T> };
    } catch (err) {
      if (err instanceof Error) {
        return error(400, err.message);
      }
      return error(400, null);
    }
  }) satisfies Plugin;
