import { ok, route, text } from "@mewhhaha/little-worker";
import { data_ } from "@mewhhaha/little-router-plugin-data";
import { type } from "arktype";

export default route(
  "/example-advanced",
  [data_(type({ value: "'apple'|'banana'" }))],
  ({ data }) => {
    if (data.value === "apple") {
      return text(406, "allergic to apples");
    }
    return ok(200, { eating: true, fruit: data.value });
  },
);
