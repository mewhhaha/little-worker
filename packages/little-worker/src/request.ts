import { type JSONString } from "@mewhhaha/json-string";

// I don't know why I put effort into making this work, but I did.
type ExtractCaseInsensitive<
  T extends Record<string, string>,
  Y extends string,
> = {
  [KEY in Extract<keyof T, string>]: Lowercase<KEY> extends Lowercase<Y>
    ? KEY
    : never;
}[Extract<keyof T, string>];

/** Function for setting up the init for a typed JSON request. This mainly cuts down having to define the Content-Type header.
 *
 * @example
 * const f = fetcher<Routes>(...)
 * f.post("/api", initJSON({ hello: "world" }))
 */
export const initJSON = <
  T,
  Y extends Record<string, string> = Record<never, never>,
>(
  body: T,
  headers: "content-type" extends Lowercase<Extract<keyof Y, string>>
    ? Omit<Y, ExtractCaseInsensitive<Y, "content-type">> & {
        [KEY in ExtractCaseInsensitive<Y, "content-type">]: "application/json";
      }
    : Y = {} as typeof headers
): {
  headers: { "Content-Type": "application/json" } & typeof headers;
  body: JSONString<T>;
} => {
  return {
    headers: {
      "Content-Type": "application/json" as const,
      ...(headers || ({} as typeof headers)),
    },
    body: JSON.stringify(body),
  };
};
