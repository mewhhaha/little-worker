import { route, text } from "@mewhhaha/little-worker";

export default route("/example-get", [], () => {
  return text(200, "Hello fetch!");
});
