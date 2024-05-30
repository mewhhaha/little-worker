import { ok, route } from "@mewhhaha/little-worker";

export default route("/example-post/:id", [], ({ params }) => {
  return ok(200, { hello: params.id });
});
