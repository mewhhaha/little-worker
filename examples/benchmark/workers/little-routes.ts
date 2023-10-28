import { Router, route } from "@mewhhaha/little-router";
import { BASE, request } from "../config.js";

const router = Router();
for (let i = 0; i < request.length; i++) {
  // Setup time also matters for cold starts
  const r0 = route(
    `${BASE}${i}/:test`,
    [],
    () => new Response(`Test route ${i}`)
  );
  router.get(...r0);

  const r1 = route(
    `${BASE}${i}/:test`,
    [],
    () => new Response(`Test route ${i}`)
  );
  router.post(...r1);

  const r2 = route(
    `${BASE}${i}/:test`,
    [],
    () => new Response(`Test route ${i}`)
  );
  router.put(...r2);
}

export default {
  fetch: router.handle,
};
