# Little Worker

This is mostly convenience package that bundles most of the packages in this repository, so there's only one import required. But this also includes a CLI to generate routes and put them in a router from a folder structure.

Re-exports the following packages:

- `@mewhhaha/typed-response`
- `@mewhhaha/typed-request`
- `@mewhhaha/little-fetcher`
- `@mewhhaha/little-router`
- `@mewhhaha/json-string`

Adds the following utilities since I keep re-using them in a lot of workers:

```tsx
// Sign data
hmac("secret key data", "message");

// Encode as trimmed base64
encode("hello world");

// Decode trimmed bse64
decode("hello world");

// Assert invariants in code
invariant(1 === 1, "1 is always equal to 1");

// Creating tagged type from other types that are distinguishable from each other
type DateISOString = TaggedType<string, "DateISOString">;
```

## CLI to generate routes

Routes can be generated by using the `little-worker routes [--target app/routes]` command. This will generate a `_router.ts` and a `_pattern.ts` file in the target folder based on the files therein. The default target folder is `app/routes`. Any files fitting the format `[method].[segment].$[parameter].ts` will be included in the router.

> The dots (`.`) will be transformed into slashes (`/`) and the dollar signs (`$`) will be changed into colons (`:`). This transformation will make it match the format in the router.

> Ending with a dollar sign (`$`) will be interpreted as a splat route, and converted to a asterisk (`*`)

> Square brackets (`[`, `]`) in a segment will escape any inside characters that would normally get removed or interpreted differently, for example this is useful when the route includes a dot (`.`) for a file ending.

> Also supports flat folders containing a `route.ts` or a `route.tsx` file. This can be helpful to co-locate code to a specific route in separate files.

Here are some examples of files and their generated equivalences in the router:

- `get.users.ts` => `.get("/users", ...)`
- `get.users.$userId.ts` => `.get("/users/:userId", ...)`
- `get.users.$userId.bananas.ts` => `.get("/users/:userId/bananas", ...)`
- `get.$.ts` => `.get("/*", ...)`
- `post.users.ts` => `.post("/users", ...)`
- `all.users.ts` => `.all("/users", ...)`
- `get.file.[manifest.js]` => `.get("/file/manifest.js", ...)`

These will be automatically sorted when the router is generated to make sure that they appear in the correct order of specificity.

### Define a route

In each of the files you created it is expected that you export a route definition as the default export. You can import the function `route` from `@mewhhaha/little-worker` (or `@mewhhaha/little-router`) that you can use to properly type your export.

> Use the [eslint plugin](#ensure-correctness-with-lint) from `@mewhhaha/little-worker/eslint-plugin` to ensure that the route is always correct.

```tsx
// In file get.users.$userId.ts
import { route, ok } from "@mewhhaha/little-worker";

export default route("/get/users/:userId", [], ({ params }) => {
  // Notice how we can access userId typed in this context
  return ok(200, { id: params.userId });
});
```

### Ensure correctness with lint

```js
// eslint.config.mjs
import worker from "@mewhhaha/little-worker/eslint-plugin";

export default [worker];
```
