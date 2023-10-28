import { Router } from "itty-router";
import { request, BASE } from "../config.js";

const router = Router();
for (let i = 0; i < request.length; i++) {
  // Setup time also matters for cold starts
  router.get(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
  router.post(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
  router.put(`${BASE}${i}/:test`, () => new Response(`Test route ${i}`));
}

export default {
  fetch: router.handle,
};
