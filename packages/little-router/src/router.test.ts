import { expect, describe, it, assertType } from "vitest";
import { JSONRequest, Router } from "./router.js";
import { JSONString } from "@mewhhaha/json-string";

describe("Router", () => {
  it("should match fixed paths", async () => {
    const router = Router().get(
      "/test",
      async () => new Response("Test route")
    );

    const request = new Request("https://example.com/test", { method: "GET" });
    const response = await router.handle(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("Test route");
  });

  it("should match path parameters", async () => {
    const router = Router().get("/user/:id", async ({ params }) => {
      return new Response(`User: ${params.id}`);
    });

    const request = new Request("https://example.com/user/42", {
      method: "GET",
    });
    const response = await router.handle(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("User: 42");
  });

  it("should match wildcard paths", async () => {
    const router = Router().get("/*", async ({ params }) => {
      return new Response(`Wildcard: ${params["*"]}`);
    });

    const request = new Request("https://example.com/some/random/path", {
      method: "GET",
    });
    const response = await router.handle(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("Wildcard: some/random/path");
  });

  it("should return a 500 status for unmatched paths", async () => {
    const router = Router().get(
      "/test",
      async () => new Response("Test route")
    );

    const request = new Request("https://example.com/unmatched", {
      method: "GET",
    });
    const response = await router.handle(request);

    expect(response.status).toBe(500);
  });

  it("should only match the correct HTTP method", async () => {
    const router = Router()
      .get("/test", async () => new Response("GET route"))
      .post("/test", async () => new Response("POST route"));

    const getRequest = new Request("https://example.com/test", {
      method: "GET",
    });
    const getResponse = await router.handle(getRequest);
    const getText = await getResponse.text();

    const postRequest = new Request("https://example.com/test", {
      method: "POST",
    });
    const postResponse = await router.handle(postRequest);
    const postText = await postResponse.text();

    expect(getResponse.status).toBe(200);
    expect(getText).toBe("GET route");
    expect(postResponse.status).toBe(200);
    expect(postText).toBe("POST route");
  });
});

describe("Router with route chaining and overlapping", () => {
  it("should handle chained routes correctly", async () => {
    const router = Router()
      .get("/test1", async () => new Response("Test route 1"))
      .get("/test2", async () => new Response("Test route 2"));

    const request1 = new Request("https://example.com/test1", {
      method: "GET",
    });
    const response1 = await router.handle(request1);
    const text1 = await response1.text();

    const request2 = new Request("https://example.com/test2", {
      method: "GET",
    });
    const response2 = await router.handle(request2);
    const text2 = await response2.text();

    expect(response1.status).toBe(200);
    expect(text1).toBe("Test route 1");
    expect(response2.status).toBe(200);
    expect(text2).toBe("Test route 2");
  });

  it("should not match overlapping routes with path parameters", async () => {
    const router = Router()
      .get("/:id", async ({ params }) => new Response(`ID: ${params.id}`))
      // @ts-expect-error
      .get("/a", async () => new Response("Fixed route"));

    const request1 = new Request("https://example.com/a", { method: "GET" });
    const response1 = await router.handle(request1);
    const text1 = await response1.text();

    expect(response1.status).toBe(200);
    expect(text1).toBe("ID: a");
  });

  it("should not match overlapping routes with wildcards", async () => {
    const router = Router()
      .get("/*", async ({ params }) => new Response(`Wildcard: ${params["*"]}`))
      // @ts-expect-error
      .get("/a/b/c", async () => new Response("Fixed route"));

    const request1 = new Request("https://example.com/a/b/c", {
      method: "GET",
    });

    const response1 = await router.handle(request1);
    const text1 = await response1.text();

    expect(response1.status).toBe(200);
    expect(text1).toBe("Wildcard: a/b/c");
  });

  it("should be able to type request as JSONRequest", async () => {
    const router = Router().post(
      "/a",
      async (_, request: JSONRequest<{ hello: "world" }>) => {
        const t = await request.text();
        assertType<JSONString<{ hello: "world" }>>(t);
        return new Response(`Body: ${JSON.parse(t).hello}`);
      }
    );

    const request1 = new Request("https://example.com/a", {
      body: JSON.stringify({ hello: "world" }),
      method: "POST",
    });

    const response1 = await router.handle(request1);
    const text1 = await response1.text();

    expect(response1.status).toBe(200);
    expect(text1).toBe("Body: world");
  });
});
