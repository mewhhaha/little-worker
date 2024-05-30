import { ok, route } from "@mewhhaha/little-worker";
import { data_ } from "@mewhhaha/little-router-plugin-data";
import { type } from "arktype";

export default route(
  "/example-post",
  [data_(type({ value: "'cow'" }))],
  async ({ data }) => {
    return ok(200, { hello: data.value });
  },
);
