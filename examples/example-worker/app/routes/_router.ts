import { Router, type RouteData } from "@mewhhaha/little-worker";
import route_0 from "./get.example-get.js";
import route_1 from "./get.example-query-params.js";
import route_2 from "./post.example-advanced.js";
import route_3 from "./post.example-post.js";
import route_4 from "./post.example-post.$id.js";
import route_5 from "./post.example-post.abc.js";
export const router = Router<
  RouteData["extra"] extends unknown[] ? RouteData["extra"] : []
>()
  .get(route_0[0], route_0[1], route_0[2])
  .get(route_1[0], route_1[1], route_1[2])
  .post(route_2[0], route_2[1], route_2[2])
  .post(route_3[0], route_3[1], route_3[2])
  .post(route_4[0], route_4[1], route_4[2])
  .post(route_5[0], route_5[1], route_5[2]);
const routes = router.infer;
export type Routes = typeof routes;

declare module "@mewhhaha/little-worker" {
  interface RouteData {
    paths:
      | "/example-get"
      | "/example-query-params"
      | "/example-advanced"
      | "/example-post"
      | "/example-post/:id"
      | "/example-post/abc";
  }
}
