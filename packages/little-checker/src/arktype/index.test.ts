import { describe, it, expect } from "vitest";
import { check } from "./index.js";
import { type } from "arktype";

describe("check", () => {
  it("should return 400 for invalid JSON", async () => {
    const f = check(type("string"), async ({ request }) => {
      const value = await request.json();
      return new Response(value);
    });

    const response = await f({
      request: new Request("http://from.fetcher", {
        body: "undefined",
        method: "POST",
      }) as any,
      params: {},
      url: new URL("http://from.fetcher"),
    });

    expect(response.status).toBe(400);
  });

  it("should return 422 for incorrect JSON", async () => {
    const f = check(type("string"), async ({ request }) => {
      const value = await request.json();
      return new Response(value);
    });

    const response = await f({
      request: new Request("http://from.fetcher", {
        body: JSON.stringify(2),
        method: "POST",
      }) as any,
      params: {},
      url: new URL("http://from.fetcher"),
    });

    expect(response.status).toBe(422);
  });

  it("should return 200 for correct JSON", async () => {
    const f = check(type("string"), async ({ request }) => {
      const value = await request.json();
      return new Response(value);
    });

    const response = await f({
      request: new Request("http://from.fetcher", {
        body: JSON.stringify("Hello world!"),
        method: "POST",
      }) as any,
      params: {},
      url: new URL("http://from.fetcher"),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Hello world!");
  });
});
