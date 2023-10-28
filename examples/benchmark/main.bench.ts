import { describe, bench } from "vitest";
import { Router as LittleRouter, route } from "@mewhhaha/little-router";
import { Router as IttyRouter } from "itty-router";
import { Hono } from "hono";

const ITERATIONS = 10000;
const BASE = `/test/`;

const BENCH_CONFIG = {
  iterations: ITERATIONS,
  warmupIterations: 10,
  warmupTime: 1000,
};

const request = [0, 1, 2, 3].flatMap((r) =>
  ["POST", "GET", "PUT"].map(
    (method) =>
      new Request(`https://example.com${BASE}${r}/${r}`, {
        method,
      })
  )
);

const randomRequest = () => request[(Math.random() * request.length) | 0];

describe("cold start static routes", () => {
  bench(
    "itty",
    async () => {
      const ittyRouter = IttyRouter();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        ittyRouter.get(
          `${BASE}${i}/${i}`,
          () => new Response(`Test route ${i}`)
        );
        ittyRouter.post(
          `${BASE}${i}/${i}`,
          () => new Response(`Test route ${i}`)
        );
        ittyRouter.put(
          `${BASE}${i}/${i}`,
          () => new Response(`Test route ${i}`)
        );
      }

      await ittyRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "hono",
    async () => {
      const honoRouter = new Hono();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        honoRouter.get(
          `${BASE}${i}/${i}`,
          () => new Response(`Test route ${i}`)
        );
        honoRouter.post(
          `${BASE}${i}/${i}`,
          () => new Response(`Test route ${i}`)
        );
        honoRouter.put(
          `${BASE}${i}/${i}`,
          () => new Response(`Test route ${i}`)
        );
      }

      await honoRouter.fetch(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      const littleRouter = LittleRouter();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        littleRouter.get(
          `${BASE}${i}/${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.post(
          `${BASE}${i}/${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.put(
          `${BASE}${i}/${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );
      }

      await littleRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little with routes",
    async () => {
      const littleRouter = LittleRouter();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        const r0 = route(
          `${BASE}${i}/${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.get(...r0);

        const r1 = route(
          `${BASE}${i}/${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.post(...r1);

        const r2 = route(
          `${BASE}${i}/${i}`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.put(...r2);
      }

      await littleRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );
});

describe("cold start dynamic routes", () => {
  bench(
    "itty",
    async () => {
      const ittyRouter = IttyRouter();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        ittyRouter.get(
          `${BASE}${i}/:test`,
          () => new Response(`Test route ${i}`)
        );
        ittyRouter.post(
          `${BASE}${i}/:test`,
          () => new Response(`Test route ${i}`)
        );
        ittyRouter.put(
          `${BASE}${i}/:test`,
          () => new Response(`Test route ${i}`)
        );
      }

      await ittyRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "hono",
    async () => {
      const honoRouter = new Hono();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        honoRouter.get(
          `${BASE}${i}/:test`,
          () => new Response(`Test route ${i}`)
        );
        honoRouter.post(
          `${BASE}${i}/:test`,
          () => new Response(`Test route ${i}`)
        );
        honoRouter.put(
          `${BASE}${i}/:test`,
          () => new Response(`Test route ${i}`)
        );
      }

      await honoRouter.fetch(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      const littleRouter = LittleRouter();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        littleRouter.get(
          `${BASE}${i}/:test`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.post(
          `${BASE}${i}/:test`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.put(
          `${BASE}${i}/:test`,
          [],
          () => new Response(`Test route ${i}`)
        );
      }

      await littleRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little with routes",
    async () => {
      const littleRouter = LittleRouter();
      for (let i = 0; i < request.length; i++) {
        // Setup time also matters for cold starts
        const r0 = route(
          `${BASE}${i}/:test`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.get(...r0);

        const r1 = route(
          `${BASE}${i}/:test`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.post(...r1);

        const r2 = route(
          `${BASE}${i}/:test`,
          [],
          () => new Response(`Test route ${i}`)
        );
        littleRouter.put(...r2);
      }

      await littleRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );
});

describe("hot start static routes", async () => {
  const ittyRouter = IttyRouter();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    ittyRouter.get(`${BASE}${i}/${i}`, () => new Response(`Test route ${i}`));
    ittyRouter.post(`${BASE}${i}/${i}`, () => new Response(`Test route ${i}`));
    ittyRouter.put(`${BASE}${i}/${i}`, () => new Response(`Test route ${i}`));
  }

  const littleRouter = LittleRouter();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    littleRouter.get(
      `${BASE}${i}/${i}`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouter.post(
      `${BASE}${i}/${i}`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouter.put(
      `${BASE}${i}/${i}`,
      [],
      () => new Response(`Test route ${i}`)
    );
  }

  const honoRouter = new Hono();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    honoRouter.get(`${BASE}${i}/${i}`, () => new Response(`Test route ${i}`));
    honoRouter.post(`${BASE}${i}/${i}`, () => new Response(`Test route ${i}`));
    honoRouter.put(`${BASE}${i}/${i}`, () => new Response(`Test route ${i}`));
  }

  const littleRouterRoutes = LittleRouter();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    const r0 = route(
      `${BASE}${i}/${i}`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouterRoutes.get(...r0);

    const r1 = route(
      `${BASE}${i}/${i}`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouterRoutes.post(...r1);

    const r2 = route(
      `${BASE}${i}/${i}`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouterRoutes.put(...r2);
  }

  bench(
    "itty",
    async () => {
      await ittyRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "hono",
    async () => {
      await honoRouter.fetch(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      await littleRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little with routes",
    async () => {
      await littleRouterRoutes.handle(randomRequest());
    },
    BENCH_CONFIG
  );
});

describe("hot start dynamic routes", async () => {
  const ittyRouter = IttyRouter();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    ittyRouter.get(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
    ittyRouter.post(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
    ittyRouter.put(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
  }

  const littleRouter = LittleRouter();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    littleRouter.get(
      `${BASE}${i}/:test`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouter.post(
      `${BASE}${i}/:test`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouter.put(
      `${BASE}${i}/:test`,
      [],
      () => new Response(`Test route ${i}`)
    );
  }

  const honoRouter = new Hono();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    honoRouter.get(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
    honoRouter.post(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
    honoRouter.put(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
  }

  const littleRouterRoutes = LittleRouter();
  for (let i = 0; i < request.length; i++) {
    // Setup time also matters for cold starts
    const r0 = route(
      `${BASE}${i}/:test`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouterRoutes.get(...r0);

    const r1 = route(
      `${BASE}${i}/:test`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouterRoutes.post(...r1);

    const r2 = route(
      `${BASE}${i}/:test`,
      [],
      () => new Response(`Test route ${i}`)
    );
    littleRouterRoutes.put(...r2);
  }

  bench(
    "itty",
    async () => {
      await ittyRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "hono",
    async () => {
      await honoRouter.fetch(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      await littleRouter.handle(randomRequest());
    },
    BENCH_CONFIG
  );

  bench(
    "little with routes",
    async () => {
      await littleRouterRoutes.handle(randomRequest());
    },
    BENCH_CONFIG
  );
});
