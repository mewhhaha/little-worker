import { ok, route } from "@mewhhaha/little-worker";

export default route("/example-post/abc", [], () => {
  return ok(200, { hello: "world" });
});
