import { describe, bench } from "vitest";
import { Router as LittleRouter } from "@mewhhaha/little-router";
import { Router as IttyRouter } from "itty-router";

const base = `/test/`;

describe("cold start", () => {
  const request = new Request(`https://example.com${base}9`, {
    method: "GET",
  });

  bench("itty", async () => {
    const ittyRouter = IttyRouter();
    for (let i = 0; i < 10; i++) {
      // Setup time also matters for cold starts
      ittyRouter.get(`${base}${i}`, () => new Response(`Test route ${i}`));
    }

    await ittyRouter.handle(request);
  });

  bench("little", async () => {
    const littleRouter = LittleRouter();
    for (let i = 0; i < 10; i++) {
      // Setup time also matters for cold starts
      littleRouter.get(
        `${base}${i}`,
        [],
        () => new Response(`Test route ${i}`)
      );

      await littleRouter.handle(request);
    }
  });
});

describe("hot start", async () => {
  const request = new Request(`https://example.com${base}9`, {
    method: "GET",
  });

  const ittyRouter = IttyRouter();

  for (let i = 0; i < 10; i++) {
    // Setup time also matters for cold starts
    ittyRouter.get(`${base}${i}`, () => new Response(`Test route ${i}`));
  }

  const littleRouter = LittleRouter();
  for (let i = 0; i < 10; i++) {
    // Setup time also matters for cold starts
    littleRouter.get(`${base}${i}`, [], () => new Response(`Test route ${i}`));
  }

  bench("itty", async () => {
    await ittyRouter.handle(request);
  });

  bench("little", async () => {
    await littleRouter.handle(request);
  });
});
