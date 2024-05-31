import { describe, expect, test } from "vitest";
import { orderRoutes } from "./generate-file-routes";

describe("orderRoutes", () => {
  test("should sort dot-delimited routes first", () => {
    const arr = ["abc", "a.b", "a.b.c"];

    expect(arr.toSorted(orderRoutes)).toEqual(["a.b.c", "a.b", "abc"]);
  });

  test("should sort more specific urls first", () => {
    const arr = ["a.$id", "a.b"];

    expect(arr.toSorted(orderRoutes)).toEqual(["a.b", "a.$id"]);
  });
});
