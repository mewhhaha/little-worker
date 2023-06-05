### little-router-plugin-data

This is a plugin for little-router that allows you to specify what kind of JSON body should be passed with the request.

## Example

```tsx
import { data_ } from "@mewhhaha/little-router-plugin-data";
import { type } from "arktype";
import { Router } from "@mewhhaha/little-router";
import { json } from "@mewhhaha/typed-response";

const router = Router().post(
  "/a",
  [data_(type({ value: "'hello'" }))],
  ({ data }) => {
    return text(200, data.value);
  }
);
```
