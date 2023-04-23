import {
  afterAll,
  assertType,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";
import { UnstableDevWorker, unstable_dev } from "wrangler";
import { fetcher } from "@mewhhaha/little-fetcher";
import { Routes } from "./main.js";

describe("example", () => {
  let worker: UnstableDevWorker;
  let f: ReturnType<typeof fetcher<Routes>>;

  beforeAll(async () => {
    worker = await unstable_dev("./main.ts");
    f = fetcher<Routes>(worker as unknown as { fetch: typeof fetch });
  });

  afterAll(() => {
    worker.stop();
  });

  test("example-get", async () => {
    const response = await f.get("/example-get");

    const value = await response.text();
    assertType<"Hello fetch!">(value);
    expect(response.status).toBe(200);
    expect(value).toBe("Hello fetch!");
  });

  test("example-post", async () => {
    const response = await f.get("/example-post/:id", {
      body: JSON.stringify({ value: "world" }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const value = await response.json();
    assertType<{ hello: "world" }>(value);
    expect(response.status).toBe(200);
    expect(value).toStrictEqual({ hello: "world" });
  });

  test("example-several-responses", async () => {
    const response = await fetch("http://localhost:4545/example-advanced", {
      body: JSON.stringify({ value: "no" }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const value = await response.json();
      assertType<{ hello: "world" }>(value);
      expect(response.status).toBe(200);
      expect(value).toStrictEqual({ hello: "world" });
    } else {
      const value = await response.text();
      assertType<"no no no">(value);
    }
  });

  test("example-search-params", async () => {
    const r1 = await fetch(
      "http://localhost:4545/example-search-params?size=32"
    );

    const v1 = await r1.json();
    assertType<{ size: `${number}` }>(v1);
    expect(r1.status).toBe(200);
    expect(v1).toStrictEqual({ size: "32" });

    const r2 = await fetch(
      "http://localhost:4545/example-search-params?size=32&sort=asc"
    );

    const v2 = await r2.json();
    assertType<{ size: `${number}`; sort: "asc" }>(v2);
    expect(r2.status).toBe(200);
    expect(v2).toStrictEqual({ size: "32", sort: "asc" });

    const r3 = await fetch(
      "http://localhost:4545/example-search-params?sort=desc"
    );

    const v3 = await r3.json();
    assertType<{ sort: "desc" }>(v3);
    expect(r3.status).toBe(200);
    expect(v3).toStrictEqual({ sort: "desc" });
  });
});
