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

  test("example-post/:id", async () => {
    const response = await f.post("/example-post/234");

    const value = await response.json();
    assertType<{ hello: string }>(value);
    expect(response.status).toBe(200);
    expect(value).toStrictEqual({ hello: "234" });
  });

  test.each(["apple", "banana"] as const)(
    "example-several-responses",
    async (fruit) => {
      const response = await f.post("/example-advanced", {
        body: JSON.stringify({ value: fruit }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const value = await response.json();
        assertType<{ eating: true; fruit: "banana" }>(value);
        expect(response.status).toBe(200);
        expect(value).toStrictEqual({ eating: true, fruit: "banana" });
      } else if (response.status === 406) {
        const value = await response.text();
        assertType<"allergic to apples">(value);
        expect(value).toBe("allergic to apples");
      }
    }
  );
});
