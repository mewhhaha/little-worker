import { Router, RoutesOf } from "@mewhhaha/little-router";
import { json, text } from "@mewhhaha/typed-response";
import { type } from "arktype";
import { check } from "@mewhhaha/little-checker/arktype";

const router = Router()
  .get("/example-get", () => {
    return text(200, "Hello fetch!");
  })
  .post(
    "/example-post",
    check(type({ value: "'world'" }), async ({ request }) => {
      const { value } = await request.json();

      return json(200, { hello: value });
    })
  )
  .post("/example-post/:id", async ({ params }) => {
    return json(200, { hello: params.id });
  })
  .post(
    "/example-advanced",
    check(type({ value: "'world'|'no'" }), async ({ request }) => {
      const { value } = await request.json();
      if (value === "no") {
        return text(422, "no no no");
      }
      return json(200, { hello: value });
    })
  )
  .get("/example-search-params", async ({ request }) => {
    const url = new URL(request.url);
    const sort = url.searchParams.get("sort");
    const size = url.searchParams.get("size");

    return json(200, { sort, size });
  });

export type Routes = RoutesOf<typeof router>;

const handler: ExportedHandler = {
  fetch: router.handle,
};

export default handler;
