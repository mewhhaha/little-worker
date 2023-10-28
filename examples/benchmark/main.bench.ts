import { describe, bench, beforeAll, afterAll } from "vitest";
import { Router as LittleRouter, route } from "@mewhhaha/little-router";
import { Router as IttyRouter } from "itty-router";
import { Hono } from "hono";
import { request, BASE, BENCH_CONFIG } from "./config.js";
import { UnstableDevWorker, unstable_dev } from "wrangler";

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

describe("workerd environment", async () => {
  const ittyWorker = await unstable_dev("workers/itty.ts");
  const honoWorker = await unstable_dev("workers/hono.ts");
  const littleWorker = await unstable_dev("workers/little.ts");
  const littleRoutesWorker = await unstable_dev("workers/little-routes.ts");

  afterAll(async () => {
    await ittyWorker.stop();
    await honoWorker.stop();
    await littleWorker.stop();
    await littleRoutesWorker.stop();
  });

  bench(
    "itty",
    async () => {
      const request = randomRequest();
      await ittyWorker.fetch(request.url, { method: request.method });
    },
    BENCH_CONFIG
  );

  bench(
    "hono",
    async () => {
      const request = randomRequest();
      await honoWorker.fetch(request.url, { method: request.method });
    },
    BENCH_CONFIG
  );

  bench(
    "little",
    async () => {
      const request = randomRequest();
      await littleWorker.fetch(request.url, { method: request.method });
    },
    BENCH_CONFIG
  );

  bench(
    "little with routes",
    async () => {
      const request = randomRequest();
      const response = await littleRoutesWorker.fetch(request.url, {
        method: request.method,
      });
    },
    BENCH_CONFIG
  );
});
