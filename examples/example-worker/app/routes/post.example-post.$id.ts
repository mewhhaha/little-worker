import { ok, route } from "@mewhhaha/little-worker";

export default route(PATTERN, [], ({ params }) => {
  return ok(200, { hello: params.id });
});
