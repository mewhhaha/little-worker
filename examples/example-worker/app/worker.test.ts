import { assertType, describe, expect, test } from "vitest";
import { SELF } from "cloudflare:test";
import { fetcher } from "@mewhhaha/little-worker";
import { Routes } from "./worker.js";

describe("example", () => {
  const f = fetcher<Routes>(SELF);

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
    },
  );

  test("example-query-params", async () => {
    const response = await f.get("/example-query-params?size=10");

    if (response.ok) {
      const value = await response.text();
      assertType<`Sort: ${"asc" | "desc" | "undefined"}, Size: ${string}`>(
        value,
      );
      expect(response.status).toBe(200);
      expect(value).toStrictEqual(`Sort: undefined, Size: 10`);
    }
  });
});
