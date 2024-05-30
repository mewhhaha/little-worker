import { route, text } from "@mewhhaha/little-worker";
import { type } from "arktype";
import { query_ } from "../../../../packages/little-router-plugin-query/dist/index.js";

export default route(
  "/example-query-params",
  [query_(type({ "sort?": "'asc'|'desc'", size: /^\d+$/ }))],
  async ({ query: { sort, size } }) => {
    return text(200, `Sort: ${sort}, Size: ${size}`);
  },
);
