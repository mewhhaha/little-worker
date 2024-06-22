import { route, text } from "@mewhhaha/little-worker";

export default route("/folder", [], () => {
  return text(200, "Hello fetch!");
});
