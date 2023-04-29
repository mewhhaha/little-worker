import { describe, it, expect, assertType } from "vitest";
import { query_ } from "./index.js";
import { type } from "arktype";
import { Router } from "@mewhhaha/little-router";
import { json, text } from "@mewhhaha/typed-response";

describe("check", () => {
  it("should return parsed headers", async () => {
    const result = await query_(type({ hello: "'world'" }))({
      request: new Request("http://from.fetcher?hello=world"),
      url: new URL("http://from.fetcher?hello=world"),
      params: {},
    });

    expect(result).toStrictEqual({ query: { hello: "world" } });
  });

  it("should work as a plugin for the router", async () => {
    const router = Router().get(
      "/a",
      [query_(type({ hello: "'world'" }))],
      ({ query: { hello } }) => {
        assertType<"world" | undefined>(hello);
        return json(200, hello);
      }
    );

    const response = await router.handle(
      new Request("http://from.fetcher/a?hello=world")
    );

    const t = await response.json();
    expect(response.status).toBe(200);
    expect(t).toBe("world");
  });
});
