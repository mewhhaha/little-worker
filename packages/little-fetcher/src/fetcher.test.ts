import { assertType, describe, expect, it } from "vitest";
import { fetcher } from "./fetcher.js";
import { PluginContext, Router, RoutesOf } from "@mewhhaha/little-router";
import { error, text } from "@mewhhaha/typed-response";

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
    const router = Router().get("/users/:id", [], async ({ params }) => {
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
    const router = Router().get(
      "/users/:id/cats/:cat",
      [],
      async ({ params }) => {
        return text(200, `User: ${params.id}, Cat: ${params.cat}`);
      }
    );

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.get(`/users/1/cats/2`);
    const t = await response.text();
    assertType<`User: ${string}, Cat: ${string}`>(t);
    expect(response.status).toBe(200);
    expect(t).toBe(`User: 1, Cat: 2`);
  });

  it("should fetch a route with two routes", async () => {
    const router = Router()
      .get("/users/:id/cats/:cat", [], async ({ params }) => {
        return text(200, `User: ${params.id}, Cat: ${params.cat}`);
      })
      .get("/users/:id/dogs/:dog", [], async ({ params }) => {
        return text(200, `User: ${params.id}, Dog: ${params.dog}`);
      });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.get(`/users/1/cats/2`);
    const t = await response.text();
    assertType<`User: ${string}, Cat: ${string}`>(t);
    expect(response.status).toBe(200);
    expect(t).toBe(`User: 1, Cat: 2`);
  });

  it("should fetch a route with different routes", async () => {
    const router = Router()
      .get("/users/:id/cats/:cat", [], async ({ params }) => {
        return text(200, `User: ${params.id}, Cat: ${params.cat}`);
      })
      .post("/users/:id/dogs/:dog", [], async ({ params }) => {
        return text(200, `User: ${params.id}, Dog: ${params.dog}`);
      });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.post("/users/1/dogs/2");
    const t = await response.text();
    assertType<`User: ${string}, Dog: ${string}`>(t);
    expect(response.status).toBe(200);
    expect(t).toBe(`User: 1, Dog: 2`);
  });

  it("should accept search param plugin", async () => {
    const plugin = async ({
      url,
    }: PluginContext<{
      search?: { sort: "asc" | "desc"; size: "10" };
    }>) => {
      const sort = url.searchParams.get("sort");
      const size = url.searchParams.get("size");
      const search: { sort?: "asc" | "desc"; size?: 10 } = {};
      if (size === "10") {
        search["size"] = Number.parseInt(size) as 10;
      } else if (size !== null) {
        return error(422, "Invalid sort params");
      }

      if (sort === "asc" || sort === "desc") {
        search["sort"] = sort;
      } else if (sort !== null) {
        return error(422, "Invalid sort params");
      }

      return { search };
    };

    const router = Router().get("/users/a", [plugin], async ({ search }) => {
      return text(200, `Search: ${search.sort}, ${search.size}`);
    });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.get("/users/a?sort=asc&size=10");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Search: asc, 10");
  });

  it.skip("should not show post route in get route", async () => {
    const router = Router()
      .get("/users/:id/cats/:cat", [], async ({ params }) => {
        return text(200, `User: ${params.id}, Cat: ${params.cat}`);
      })
      .post("/users/:id/dogs/:dog", [], async ({ params }) => {
        return text(200, `User: ${params.id}, Dog: ${params.dog}`);
      });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    //@ts-expect-error
    await f.get("/users/:id/dogs/:dog");
  });

  it.skip("should give error on missing headers", async () => {
    const plugin = async (
      _: PluginContext<{ init: { headers: { "X-Header": "value" } } }>
    ) => {
      return {};
    };

    const router = Router().post(
      "/users/:id/dogs/:dog",
      [plugin],
      async ({ params }) => {
        return text(200, `User: ${params.id}, Dog: ${params.dog}`);
      }
    );

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    // @ts-expect-error
    f.post("/users/:id/dogs/:dog");

    // @ts-expect-error
    f.post("/users/:id/dogs/:dog", { headers: {} });

    f.post("/users/:id/dogs/:dog", { headers: { "X-Header": "value" } });
  });

  it.skip("should give error on missing body", async () => {
    const plugin = async (_: PluginContext<{ init: { body: "body" } }>) => {
      return {};
    };

    const router = Router().post(
      "/users/:id/dogs/:dog",
      [plugin],
      async ({ params }) => {
        return text(200, `User: ${params.id}, Dog: ${params.dog}`);
      }
    );

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    // @ts-expect-error
    f.post("/users/:id/dogs/:dog");

    f.post("/users/:id/dogs/:dog", {
      body: "body",
    });
  });
});
