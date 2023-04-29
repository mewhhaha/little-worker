import { describe, it, expect, assertType } from "vitest";
import { data_ } from "./index.js";
import { type } from "arktype";
import { Router, RoutesOf } from "@mewhhaha/little-router";
import { text } from "@mewhhaha/typed-response";
import { fetcher } from "@mewhhaha/little-fetcher";

const mock = <
  R extends { handle: (request: Request) => Promise<Response> | Response }
>(
  r: R
): { fetch: typeof fetch } => ({
  fetch: async (url, init) => {
    const request = new Request(url, init);
    return r.handle(request);
  },
});

describe("check", () => {
  it("should return 400 for invalid JSON", async () => {
    try {
      await data_(type("string"))(
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
      await data_(type("string"))(
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
    const result = await data_(type("string"))({
      request: new Request("http://from.fetcher", {
        body: JSON.stringify("Hello world!"),
        method: "POST",
      }),
      url: new URL("http://from.fetcher"),
      params: {},
    });
    expect(result).toStrictEqual({ data: "Hello world!" });
  });

  it("should work as a plugin for the router", async () => {
    const router = Router().post("/a", [data_(type("'hello'"))], ({ data }) => {
      assertType<"hello">(data);
      return text(200, data);
    });

    const response = await router.handle(
      new Request("http://from.fetcher/a", {
        body: JSON.stringify("hello"),
        method: "POST",
      })
    );

    const t = await response.text();
    expect(response.status).toBe(200);
    expect(t).toBe("hello");
  });

  it.skip("should work with fetcher", async () => {
    const router = Router().post("/a", [data_(type("'hello'"))], ({ data }) => {
      assertType<"hello">(data);
      return text(200, data);
    });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.post("/a", {
      body: JSON.stringify("hello"),
      headers: { "Content-Type": "application/json" },
    });

    const t = await response.text();
    expect(response.status).toBe(200);
    expect(t).toBe("hello");
  });

  it.skip("should fail fetcher typing", async () => {
    const router = Router().post("/a", [data_(type("'hello'"))], ({ data }) => {
      assertType<"hello">(data);
      return text(200, data);
    });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    // @ts-expect-error
    f.post("/a", { data: "hello" });
    const response = await router.handle(
      new Request("http://from.fetcher/a", {
        body: JSON.stringify("hello"),
        method: "POST",
      })
    );

    const t = await response.text();
    expect(response.status).toBe(200);
    expect(t).toBe("hello");
  });
});
