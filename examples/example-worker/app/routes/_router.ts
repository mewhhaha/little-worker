import { Router, type RouteData } from "@mewhhaha/little-worker";
import route_0 from "./get.example-get.js";
import route_1 from "./get.example-query-params.js";
import route_2 from "./post.example-advanced.js";
import route_3 from "./post.example-post.$id.js";
import route_4 from "./post.example-post.js";
export const router = Router<
  RouteData["extra"] extends unknown[] ? RouteData["extra"] : []
>()
  .get("/example-get", route_0[1], route_0[2])
  .get("/example-query-params", route_1[1], route_1[2])
  .post("/example-advanced", route_2[1], route_2[2])
  .post("/example-post/:id", route_3[1], route_3[2])
  .post("/example-post", route_4[1], route_4[2]);
const routes = router.infer;
export type Routes = typeof routes;
declare module "./get.example-get.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-get";
}
declare module "./get.example-query-params.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-query-params";
}
declare module "./post.example-advanced.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-advanced";
}
declare module "./post.example-post.$id.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-post/:id";
}
declare module "./post.example-post.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-post";
}
