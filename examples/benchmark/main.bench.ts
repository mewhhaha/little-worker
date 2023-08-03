import { describe, bench } from "vitest";
import { Router as LittleRouter } from "@mewhhaha/little-router";
import { Router as IttyRouter } from "itty-router";
import { Hono } from "hono";

const ITERATIONS = 10000;
const BASE = `/test/`;

const BENCH_CONFIG = {
  iterations: ITERATIONS,
  warmupIterations: 10,
  warmupTime: 1000,
};

describe("cold start", () => {
  const request = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((r) =>
    ["POST", "GET", "PUT"].map(
      (method) =>
        new Request(`https://example.com${BASE}${r}`, {
          method,
        })
    )
  );

  bench(
    "itty",
    async () => {
      const ittyRouter = IttyRouter();
      for (let i = 0; i < 10; i++) {
        // Setup time also matters for cold starts
        ittyRouter.get(`${BASE}${i}`, () => new Response(`Test route ${i}`));
        ittyRouter.post(`${BASE}${i}`, () => new Response(`Test route ${i}`));
        ittyRouter.put(`${BASE}${i}`, () => new Response(`Test route ${i}`));
      }

      await ittyRouter.handle(request[(Math.random() * 30) | 0]);
    },
    BENCH_CONFIG
  );

  bench(
    "hono",
    async () => {
      const honoRouter = new Hono();
      for (let i = 0; i < 10; i++) {
        // Setup time also matters for cold starts
        honoRouter.get(`${BASE}${i}`, (c) => c.body(`Test route ${i}`));
        honoRouter.post(`${BASE}${i}`, (c) => c.body(`Test route ${i}`));
        honoRouter.put(`${BASE}${i}`, (c) => c.body(`Test route ${i}`));
      }

      await honoRouter.fetch(request[(Math.random() * 30) | 0]);
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
        littleRouter.post(
          `${BASE}${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.put(
          `${BASE}${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );

        await littleRouter.handle(request[(Math.random() * 30) | 0]);
      }
    },
    BENCH_CONFIG
  );
});

describe("hot start", async () => {
  const request = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((r) =>
    ["POST", "GET", "PUT"].map(
      (method) =>
        new Request(`https://example.com${BASE}${r}`, {
          method,
        })
    )
  );

  const ittyRouter = IttyRouter();
  for (let i = 0; i < 10; i++) {
    // Setup time also matters for cold starts
    ittyRouter.get(`${BASE}${i}`, () => new Response(`Test route ${i}`));
    ittyRouter.post(`${BASE}${i}`, () => new Response(`Test route ${i}`));
    ittyRouter.put(`${BASE}${i}`, () => new Response(`Test route ${i}`));
  }

  const littleRouter = LittleRouter();
  for (let i = 0; i < 10; i++) {
    // Setup time also matters for cold starts
    littleRouter.get(`${BASE}${i}`, [], () => new Response(`Test route ${i}`));
    littleRouter.post(`${BASE}${i}`, [], () => new Response(`Test route ${i}`));
    littleRouter.put(`${BASE}${i}`, [], () => new Response(`Test route ${i}`));
  }

  const honoRouter = new Hono();
  for (let i = 0; i < 10; i++) {
    // Setup time also matters for cold starts
    honoRouter.get(`${BASE}${i}`, (c) => c.body(`Test route ${i}`));
    honoRouter.post(`${BASE}${i}`, (c) => c.body(`Test route ${i}`));
    honoRouter.put(`${BASE}${i}`, (c) => c.body(`Test route ${i}`));
  }

  bench(
    "itty",
    async () => {
      await ittyRouter.handle(request[(Math.random() * 30) | 0]);
    },
    BENCH_CONFIG
  );

  bench(
    "hono",
    async () => {
      await honoRouter.fetch(request[(Math.random() * 30) | 0]);
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      await littleRouter.handle(request[(Math.random() * 30) | 0]);
    },
    BENCH_CONFIG
  );
});
