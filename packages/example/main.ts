import express from "express";

const app = express()
  .get("/example-get", (_, response) => {
    response.send("Hello fetch!");
  })
  .post("/example-post", express.json(), async (request, response) => {
    const { value } = request.body as { value: string };
    response.json({ hello: value });
  })
  .post("/example-advanced", express.json(), async (request, response) => {
    const { value } = request.body as { value: string };
    if (value === "no") {
      response.status(422).send("no no no");
    }
    response.json({ hello: value });
  })
  .get("/example-search-params", async (request, response) => {
    const url = new URL(request.url);
    const sort = url.searchParams.get("sort");
    const size = url.searchParams.get("size");

    response.json({ sort, size });
  });

export const start = () => app.listen(4545);
