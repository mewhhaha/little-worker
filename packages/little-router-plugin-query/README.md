### little-router-plugin-query

This is a plugin for little-router that allows you to specify query params that should or could be passed along with the request.

## Example

```tsx
import { query_ } from "@mewhhaha/little-router-plugin-query";
import { type } from "arktype";
import { Router } from "@mewhhaha/little-router";
import { json } from "@mewhhaha/typed-response";

const router = Router().get(
  "/a",
  [query_(type({ hello: "'world'" }))],
  ({ query: { hello } }) => {
    return json(200, hello);
  }
);
```
