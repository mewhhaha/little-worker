# Little Router

`little-router` is a simple router for Cloudflare workers.

- Builder pattern
- Typed route parameters
- Async plugin system
- Exposed type for routes that can be used with `little-fetcher`
- Small size

```tsx
import { Router } from "@mewhhaha/little-router";
import { ok } from "@mewhhaha/typed-response";

// Create a router instance using the builder pattern
const router = Router()
  // The other expected methods can be used here as well
  .get("/user/:id", [], async ({ params }) => {
    return ok(200, { message: `User: ${params.id}` });
  })
  // Special catch-all method, mostly for sending back a 404
  .all("/*", [], () => new Response(null, { status: 404 }));
```

## Usage with Cloudflare workers

```tsx
import { Router } from "@mewhhaha/little-router";
import { ok } from "@mewhhaha/typed-response";

type Env = {
  // Whatever your env is
  MY_STRING: string;
};

// In a worker the Env and the ExecutionContext will be
// passed along with the request.

// The rest parameters can be typed in the generic parameter like this.
const router = Router<[Env, ExecutionContext]>().get(
  "/user/:id",
  [],
  // The rest parameters will show up after the first object
  async ({ params }, env, ctx) => {
    const postUpdate = async () => {
      console.log("hello");
    };
    ctx.waitUntil(postUpdate());

    return ok(200, { message: env.MY_STRING });
  }
);

export default {
  fetch: router.handle,
};
```

## Usage with fetcher

When combined with [little-fetcher](../little-fetcher/) this gives you comprehensive way of doing server-client communication. Routes are generated from `little-router` which can then be consumed by `little-fetcher` which is essentially a wrapper that adds types to the `fetch` API or `Durable Object` stubs.

```tsx
// Package: my-worker
import { Router } from "@mewhhaha/little-router";
import { ok } from "@mewhhaha/typed-response";

// A simple router that uses the @mewhhaha/typed-response package
const router = Router().get("/user/:id", [], async ({ params }) => {
  return ok(200, { message: `User: ${params.id}` });
});

// .infer is a non-value that has all the inferred route types
// If you want to shave off the complex type from the router
// you have to set it as an intermediate variable
const routes = router.infer;
export type Routes = typeof routes;

export default {
  fetch: router.handle,
};

// Package: my-application
import { Routes } from "my-worker";
import { fetcher } from "@mewhhaha/little-fetcher";

const worker = fetcher<Routes>("fetch", { base: "http://url-to-worker" });

// This has the same API as 'fetch' and returns typed responses if 'typed-response' was used
const response = await worker.get("/user/:id");

// Since we used 'ok' from typed-response then this is also typed
const { message } = await response.json();
//      ^ This has type `User: ${string}`
```

## Usage with plugins

When combined with plugins you can set requirements on your routes and give hints to the fetcher. A route may have several plugins on it, and those are run asynchronously. If you want to synchronize several plugins you can just make an async plugin that coordinates the synchronous operations.

A common example of a plugin would be to create an authentication plugin.

```tsx
// Package: my-plugin-auth

import { PluginContext, Plugin } from "@mewhhaha/little-router";
import { err } from "@mewhhaha/typed-response";

const validate = (authorization: string) => {
  if (authorization === "trust me bro") {
    return { valid: true, data: { username: "foobar" } } as const;
  }
  return { valid: false } as const;
};

const auth_ = ({
  request,
  // The PluginContext allows you to specify hints to the `little-fetcher` client
}: PluginContext<{
  init: {
    // These are just hints to the client and should always be validated
    headers: { Authorization: string } & Record<string, string>;
  };
}>) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    // If a response is returned,
    // those will be added to the possible responses from this route
    return err(401, { message: "authorization_missing" });
  }

  const { valid, data } = validate(authorization);
  if (!valid) {
    return err(403, { message: "forbidden" });
  }

  // Anything returned from the plugin will be merged into
  // the first object in the route
  return { auth: data };
  // If a duplicate object is detected, then it will crash for safety's sake

  // The plugin can also be passed a generic parameter
  // if there are any rest parameters needed
  // eg. Plugin<[Env, ExecutionContext]>
} satisfies Plugin;

// Package: my-worker
import { auth_ } from "my-plugin-auth";
import { Router } from "@mewhhaha/little-router";
import { ok } from "@mewhhaha/typed-response";

// The auth_ plugin is added to the array in the route
// Any number of plugins can be added in the array
const router = Router().get("/user/:id", [auth_], async ({ params, auth }) => {
  // We now have the data `auth` that we returned from the plugin
  return ok(200, { message: `User: ${auth.username}` });
});

const routes = router.infer;
export type Routes = typeof routes;

// Package: my-application
import { Routes } from "my-worker";
import { fetcher } from "@mewhhaha/little-fetcher";

const worker = fetcher<Routes>("fetch", { base: "http://url-to-worker" });

const response = await worker.get("/user/:id", {
        // This is now a required header because of the hint in the plugin
        headers: { "Authorization": "trust-me-bro" }
    });
```

## Usage with Durable Objects

Here's an example of how to use the router with a Durable Object. You can either create the router outside of the class or create it internally as a static value.

```tsx
// Package: my-worker
import { Router } from "@mewhhaha/little-router";
import { ok } from "@mewhhaha/typed-response";

export class DurableObjectTest implements DurableObject {
  count: number;

  static router = Router<DurableObjectTest>()
    .post("/increment", [], (_, self) => {
      self.count++;
      return ok(200, { count: self.count });
    })
    .post("/decrement", [], (_, self) => {
      self.count--;
      return ok(200, { count: self.count });
    });

  fetch(request) {
    return DurableObjectTest.router(request, this);
  }
}

const routes = DurableObjectTest.router.infer;
type Routes = typeof routes;

type Env = {
  // The namespace corresponding to the durable object
  DO_TEST: DurableObjectNamespace;
};

export default {
  fetch: (request: Request, env: Env) => {
    const stub = env.DO_TEST.get(env.DO_TEST.idFromName("foobar"));
    // Just pass the fetcher the stub with the routes
    const test = fetcher<Routes>(stub);

    await test.post("/increment");
    await test.post("/decrement");
  },
};
```
