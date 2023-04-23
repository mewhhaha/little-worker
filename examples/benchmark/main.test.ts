import { describe, expect, test } from "vitest";
import { Router as LittleRouter } from "@mewhhaha/little-router";
import { Router as IttyRouter } from "itty-router";
describe("benchmark", () => {
  let ittyRouter = IttyRouter();
  let littleRouter = LittleRouter();

  test("speed", async () => {
    const request = new Request("https://example.com/test999", {
      method: "GET",
    });
    const startItty = performance.now();
    for (let i = 0; i < 1000; i++) {
      // Setup time also matters for cold starts
      ittyRouter.get(`/test${i}`, () => new Response(`Test route ${i}`));
    }
    for (let i = 0; i < 10000; i++) {
      await ittyRouter.handle(request);
    }
    const endItty = performance.now();

    const startLittle = performance.now();
    for (let i = 0; i < 1000; i++) {
      // Setup time also matters for cold starts
      littleRouter.get(`/test${i}`, [], () => new Response(`Test route ${i}`));
    }
    for (let i = 0; i < 10000; i++) {
      await littleRouter.handle(request);
    }
    const endLittle = performance.now();

    expect(`Itty ${endItty - startItty}`).toStrictEqual(
      `Little ${endLittle - startLittle}`
    );
  });
});
