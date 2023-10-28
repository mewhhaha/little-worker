import { route, text } from "@mewhhaha/little-worker";

export default route(PATTERN, [], () => {
  return text(200, "Hello fetch!");
});
