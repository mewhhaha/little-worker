import { assertType, describe, expect, it } from "vitest";
import { fetcher } from "./fetcher.js";
import { Router, RoutesOf } from "@mewhhaha/little-router";
import { text } from "@mewhhaha/typed-response";

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

describe("fetcher", () => {
  it("should fetch a route with one param", async () => {
    const router = Router().get("/users/:id", async ({ params }) => {
      return text(200, `User: ${params.id}`);
    });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.get("/users/1");
    const t = await response.text();
    assertType<`User: ${string}`>(t);
    expect(response.status).toBe(200);
    expect(t).toBe(`User: 1`);
  });

  it("should fetch a route with two params", async () => {
    const router = Router().get("/users/:id/cats/:cat", async ({ params }) => {
      return text(200, `User: ${params.id}, Cat: ${params.cat}`);
    });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.get(`/users/1/cats/2`);
    const t = await response.text();
    assertType<`User: ${string}, Cat: ${string}`>(t);
    expect(response.status).toBe(200);
    expect(t).toBe(`User: 1, Cat: 2`);
  });

  it("should fetch a route with two routes", async () => {
    const router = Router()
      .get("/users/:id/cats/:cat", async ({ params }) => {
        return text(200, `User: ${params.id}, Cat: ${params.cat}`);
      })
      .get("/users/:id/dogs/:dog", async ({ params }) => {
        return text(200, `User: ${params.id}, Dog: ${params.dog}`);
      });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.get(`/users/1/cats/2`);
    const t = await response.text();
    assertType<`User: ${string}, Cat: ${string}`>(t);
    expect(response.status).toBe(200);
    expect(t).toBe(`User: 1, Cat: 2`);
  });
});
