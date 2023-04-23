import { Router, RoutesOf } from "@mewhhaha/little-router";
import { json, text } from "@mewhhaha/typed-response";
import { type } from "arktype";
import { RequestOf, check } from "@mewhhaha/little-checker/arktype";

const parseCow = check(type({ value: "'cow'" }));
const parseAppleOrBanana = check(type({ value: "'apple'|'banana'" }));

const router = Router()
  .get("/example-get", () => {
    return text(200, "Hello fetch!");
  })
  .post("/example-post/:id", async ({ params }) => {
    return json(200, { hello: params.id });
  })
  .post("/example-post", async (_, request: RequestOf<typeof parseCow>) => {
    const { value } = await parseCow(request);
    return json(200, { hello: value });
  })
  .post(
    "/example-advanced",
    async (_, request: RequestOf<typeof parseAppleOrBanana>) => {
      const { value } = await parseAppleOrBanana(request);
      if (value === "apple") {
        return text(422, "allergic to apples");
      }
      return json(200, { eating: true, fruit: value });
    }
  )
  .get("/example-search-params", async ({ url }) => {
    const sort = url.searchParams.get("sort");
    const size = url.searchParams.get("size");

    return json(200, { sort, size });
  });

export type Routes = RoutesOf<typeof router>;

const handler: ExportedHandler = {
  fetch: router.handle,
};

export default handler;
