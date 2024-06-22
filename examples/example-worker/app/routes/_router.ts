import { Router, type RouteData } from "@mewhhaha/little-worker";
import route_Z2V0LmZvbGRlcg from "./get.folder/route.js";
import route_Z2V0LmV4YW1wbGUtcXVlcnktcGFyYW1zLnRz from "./get.example-query-params.js";
import route_Z2V0LmV4YW1wbGUtZ2V0LnRz from "./get.example-get.js";
import route_Z2V0LiQudHM from "./get.$.js";
import route_cG9zdC5leGFtcGxlLXBvc3QuYWJjLnRz from "./post.example-post.abc.js";
import route_cG9zdC5leGFtcGxlLXBvc3QuJGlkLnRz from "./post.example-post.$id.js";
import route_cG9zdC5leGFtcGxlLXBvc3QudHM from "./post.example-post.js";
import route_cG9zdC5leGFtcGxlLWFkdmFuY2VkLnRz from "./post.example-advanced.js";
export const router = Router<
  RouteData["extra"] extends unknown[] ? RouteData["extra"] : []
>()
  .get(...route_Z2V0LmZvbGRlcg)
  .get(...route_Z2V0LmV4YW1wbGUtcXVlcnktcGFyYW1zLnRz)
  .get(...route_Z2V0LmV4YW1wbGUtZ2V0LnRz)
  .get(...route_Z2V0LiQudHM)
  .post(...route_cG9zdC5leGFtcGxlLXBvc3QuYWJjLnRz)
  .post(...route_cG9zdC5leGFtcGxlLXBvc3QuJGlkLnRz)
  .post(...route_cG9zdC5leGFtcGxlLXBvc3QudHM)
  .post(...route_cG9zdC5leGFtcGxlLWFkdmFuY2VkLnRz);
const routes = router.infer;
export type Routes = typeof routes;

declare module "@mewhhaha/little-worker" {
  interface RouteData {
    paths:
      | "/folder"
      | "/example-query-params"
      | "/example-get"
      | "/*"
      | "/example-post/abc"
      | "/example-post/:id"
      | "/example-post"
      | "/example-advanced";
  }
}
