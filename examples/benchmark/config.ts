export const ITERATIONS = 10000;
export const BASE = `/test/`;

export const BENCH_CONFIG = {
  iterations: ITERATIONS,
  warmupIterations: 10,
  warmupTime: 1000,
};

export const request = [0, 1, 2, 3].flatMap((r) =>
  ["POST", "GET", "PUT"].map(
    (method) =>
      new Request(`https://example.com${BASE}${r}/${r}`, {
        method,
      })
  )
);
