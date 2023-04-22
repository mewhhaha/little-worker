import { match } from "./match";
import { describe, it, expect } from "vitest";

describe("match", () => {
  it("should return a wildcard match", () => {
    const segments = ["a", "b", "c"];
    const pattern = ["*"];
    expect(match(segments, pattern)).toEqual({ "*": "a/b/c" });
  });

  it("should return null for non-matching lengths and no wildcard", () => {
    const segments = ["a", "b", "c"];
    const pattern = ["a", "b"];
    expect(match(segments, pattern)).toBeNull();
  });

  it("should return null for non-matching segments", () => {
    const segments = ["a", "b", "c"];
    const pattern = ["a", "x", "c"];
    expect(match(segments, pattern)).toBeNull();
  });

  it("should return params for matching path segments", () => {
    const segments = ["a", "b", "c"];
    const pattern = ["a", ":var1", "c"];
    expect(match(segments, pattern)).toEqual({ var1: "b" });
  });

  it("should return params for wildcard and matching path segments", () => {
    const segments = ["a", "b", "c", "d", "e"];
    const pattern = ["a", ":var1", "*"];
    expect(match(segments, pattern)).toEqual({ var1: "b", "*": "c/d/e" });
  });

  it("should return an empty object for matching fixed path segments", () => {
    const segments = ["a", "b", "c"];
    const pattern = ["a", "b", "c"];
    expect(match(segments, pattern)).toEqual({});
  });
});
