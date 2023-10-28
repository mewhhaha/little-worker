import { Router } from "@mewhhaha/little-router";
import { BASE, request } from "../config.js";

const router = Router();
for (let i = 0; i < request.length; i++) {
  router.get(`${BASE}${i}/:test`, [], () => new Response(`Test route ${i}`));
  router.post(`${BASE}${i}/:test`, [], () => new Response(`Test route ${i}`));
  router.put(`${BASE}${i}/:test`, [], () => new Response(`Test route ${i}`));
}

export default {
  fetch: router.handle,
};
