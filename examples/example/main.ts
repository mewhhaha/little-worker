import { Router, RoutesOf } from "@mewhhaha/little-router";
import { data_ } from "@mewhhaha/little-router-plugin-data";
import { query_ } from "@mewhhaha/little-router-plugin-query";
import { type } from "arktype";
import { text, json } from "@mewhhaha/typed-response";

const router = Router()
  .get("/example-get", [], () => {
    return text(200, "Hello fetch!");
  })
  .post("/example-post/:id", [], async ({ params }) => {
    return json(200, { hello: params.id });
  })
  .post(
    "/example-post",
    [data_(type({ value: "'cow'" }))],
    async ({ data }) => {
      return json(200, { hello: data.value });
    }
  )
  .post(
    "/example-advanced",
    [data_(type({ value: "'apple'|'banana'" }))],
    async ({ data }) => {
      if (data.value === "apple") {
        return text(406, "allergic to apples");
      }
      return json(200, { eating: true, fruit: data.value });
    }
  )
  .get(
    "/example-query-params",
    [query_(type({ "sort?": "'asc'|'desc'", size: /^\d+$/ }))],
    async ({ query: { sort, size } }) => {
      return text(200, `Sort: ${sort}, Size: ${size}`);
    }
  );

export type Routes = RoutesOf<typeof router>;

const handler = {
  fetch: router.handle,
};

export default handler;
