import { describe, expect, test } from "vitest";
import { orderRoutes } from "./generate-file-routes";

describe("orderRoutes", () => {
  test("should sort dot-delimited routes first", () => {
    const arr = ["get.abc", "get.a.b", "get.a.b.c"];

    expect(arr.toSorted(orderRoutes)).toEqual([
      "get.a.b.c",
      "get.a.b",
      "get.abc",
    ]);
  });

  test("should sort more specific urls first", () => {
    const arr = ["get.a.$id", "get.a.b"];

    expect(arr.toSorted(orderRoutes)).toEqual(["get.a.b", "get.a.$id"]);
  });

  test("should sort get first", () => {
    const arr = ["post.a", "get.a"];

    expect(arr.toSorted(orderRoutes)).toEqual(["get.a", "post.a"]);
  });
});
