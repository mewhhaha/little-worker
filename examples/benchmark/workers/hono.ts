import { Hono } from "hono";
import { BASE, request } from "../config.js";

const router = new Hono();
for (let i = 0; i < request.length; i++) {
  // Setup time also matters for cold starts
  router.get(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
  router.post(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
  router.put(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
}

export default router;
