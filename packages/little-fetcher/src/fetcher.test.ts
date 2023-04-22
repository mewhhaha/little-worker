import { assertType, describe, expect, it } from "vitest";
import { fetcher } from "./fetcher";
import { Router, RoutesOf } from "@mewhhaha/little-router";
import { text } from "@mewhhaha/typed-response-fns";

const mock = <
  R extends { handle: (request: Request) => Promise<Response> | Response }
>(
  r: R
) => ({
  fetch: (url: string, init?: RequestInit | undefined) => {
    const request = new Request(url, init);
    return r.handle(request);
  },
});

describe("fetcher", () => {
  it("should fetch a user with get", async () => {
    const router = Router().get("/users/:id", async ({ params }) => {
      return text(200, `User: ${params.id}`);
    });

    const f = fetcher<RoutesOf<typeof router>>(mock(router));

    const response = await f.get("/users/1");
    const t = await response.text();
    assertType<`User: ${string}`>(t);

    expect(response.status).toBe(`User: 1`);
  });
});
