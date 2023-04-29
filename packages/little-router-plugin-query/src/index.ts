import {
  type Plugin,
  type PluginContext,
  type Queries,
  error,
} from "@mewhhaha/little-router";
import { type Type } from "arktype";

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
 * @param parser
 * @param param1
 * @returns
 */

type InferIn<T> = Type<T> extends { inferIn: infer I extends Queries }
  ? I
  : never;

export const query_ = <IN extends InferIn<T>, T>(
  parser: Type<InferIn<T> extends never ? never : T>,
  { arrayDelimiter = "," }: SearchOptions = {}
) =>
  (async ({
    url,
  }: PluginContext<{
    search?: IN;
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

      return { query: r.data as T };
    } catch (err) {
      if (err instanceof Error) {
        return error(400, err.message);
      }
      return error(400, null);
    }
  }) satisfies Plugin;
