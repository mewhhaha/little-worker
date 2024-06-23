import { describe, expect, it } from "vitest";
import { fileToPath, orderRoutes } from "./generate-file-routes";

describe("orderRoutes", () => {
  it("should sort dot-delimited routes first", () => {
    const arr = ["get.abc", "get.a.b", "get.a.b.c"];

    expect(arr.toSorted(orderRoutes)).toEqual([
      "get.a.b.c",
      "get.a.b",
      "get.abc",
    ]);
  });

  it("should sort more specific urls first", () => {
    const arr = ["get.a.$id", "get.a.b"];

    expect(arr.toSorted(orderRoutes)).toEqual(["get.a.b", "get.a.$id"]);
  });

  it("should sort get first", () => {
    const arr = ["post.a", "get.a"];

    expect(arr.toSorted(orderRoutes)).toEqual(["get.a", "post.a"]);
  });
});

describe("fileToPath", () => {
  it("should remove .ts or .tsx extensions", () => {
    expect(fileToPath("example.ts")).toBe("example");
    expect(fileToPath("example.tsx")).toBe("example");
  });

  it("should replace method prefixes", () => {
    expect(fileToPath("post.example")).toBe("/example");
    expect(fileToPath("get.example")).toBe("/example");
    expect(fileToPath("delete.example")).toBe("/example");
    expect(fileToPath("put.example")).toBe("/example");
    expect(fileToPath("options.example")).toBe("/example");
    expect(fileToPath("all.example")).toBe("/example");
    expect(fileToPath("patch.example")).toBe("/example");
  });

  it("should replace unescaped dots with slashes", () => {
    expect(fileToPath("example.file")).toBe("example/file");
    expect(fileToPath("example.[file.tsx]")).toBe("example/file.tsx");
  });

  it("should replace $ at the end with *", () => {
    expect(fileToPath("$")).toBe("*");
  });

  it("should replace all $ with :", () => {
    expect(fileToPath("$test")).toBe(":test");
  });

  it("should escape brackets correctly", () => {
    expect(fileToPath("[test.jsx]")).toBe("test.jsx");
  });

  it("should handle root path correctly", () => {
    expect(fileToPath("get._index.tsx")).toBe("/");
  });
});
