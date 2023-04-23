import { describe, it, expect } from "vitest";
import { check } from "./index.js";
import { type } from "arktype";

describe("check", () => {
  it("should return 400 for invalid JSON", async () => {
    try {
      await check(
        type("string"),
        new Request("http://from.fetcher", {
          body: "undefined",
          method: "POST",
        }) as any
      );
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      if (e instanceof Response) {
        expect(e.status).toBe(400);
      }
    }
  });

  it("should return 422 for incorrect JSON", async () => {
    try {
      await check(
        type("string"),
        new Request("http://from.fetcher", {
          body: JSON.stringify(2),
          method: "POST",
        }) as any
      );
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      if (e instanceof Response) {
        expect(e.status).toBe(400);
      }
    }
  });

  it("should return 200 for correct JSON", async () => {
    const result = await check(
      type("string"),
      new Request("http://from.fetcher", {
        body: JSON.stringify("Hello world!"),
        method: "POST",
      }) as any
    );
    expect(result).toBe("Hello world!");
  });
});
