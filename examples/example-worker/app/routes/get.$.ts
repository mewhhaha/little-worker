import { route, text } from "@mewhhaha/little-worker";

export default route("/*", [], () => {
  return text(200, "Hello fetch!");
});
