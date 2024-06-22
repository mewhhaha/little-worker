import { route, text } from "@mewhhaha/little-worker";

export default route("/webmanifest.js", [], () => {
  return text(200, "Hello fetch!");
});
