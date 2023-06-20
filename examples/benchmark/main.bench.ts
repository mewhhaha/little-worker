import { describe, bench } from "vitest";
import { Router as LittleRouter } from "@mewhhaha/little-router";
import { Router as IttyRouter } from "itty-router/Router.js";

const ITERATIONS = 10000;
const BASE = `/test/`;

const BENCH_CONFIG = {
  iterations: ITERATIONS,
  warmupIterations: 10,
  warmupTime: 1000,
};

describe("cold start", () => {
  const request = new Request(`https://example.com${BASE}9`, {
    method: "GET",
  });

  bench(
    "itty",
    async () => {
      const ittyRouter = IttyRouter();
      for (let i = 0; i < 10; i++) {
        // Setup time also matters for cold starts
        ittyRouter.get(`${BASE}${i}`, () => new Response(`Test route ${i}`));
      }

      await ittyRouter.handle(request);
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      const littleRouter = LittleRouter();
      for (let i = 0; i < 10; i++) {
        // Setup time also matters for cold starts
        littleRouter.get(
          `${BASE}${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );

        await littleRouter.handle(request);
      }
    },
    BENCH_CONFIG
  );
});

describe("hot start", async () => {
  const request = new Request(`https://example.com${BASE}9`, {
    method: "GET",
  });

  const ittyRouter = IttyRouter();

  for (let i = 0; i < 10; i++) {
    // Setup time also matters for cold starts
    ittyRouter.get(`${BASE}${i}`, () => new Response(`Test route ${i}`));
  }

  const littleRouter = LittleRouter();
  for (let i = 0; i < 10; i++) {
    // Setup time also matters for cold starts
    littleRouter.get(`${BASE}${i}`, [], () => new Response(`Test route ${i}`));
  }

  bench(
    "itty",
    async () => {
      await ittyRouter.handle(request);
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      await littleRouter.handle(request);
    },
    BENCH_CONFIG
  );
});
