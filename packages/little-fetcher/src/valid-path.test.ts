import { assertType, describe, it } from "vitest";
import { ValidPath, ValidPathname, ValidSearch } from "./valid-path.js";

describe("ValidPath", () => {
  it.skip("should return true", () => {
    assertType<
      ValidPath<
        "/users/1/dogs/2?sort=asc&size=2",
        "/users/:id/dogs/:dog",
        { sort: string; size: string }
      >
    >(true);

    assertType<
      ValidPath<
        "/users/1?sort=asc&size=2",
        "/users/1",
        { sort: string; size: string }
      >
    >(true);
  });
});

describe("ValidPathname", () => {
  it.skip("should support params", () => {
    assertType<ValidPathname<"/users/1/dogs/2", "/users/:id/dogs/:dog">>(true);
  });

  it.skip("should support exact path", () => {
    assertType<ValidPathname<"/users/1", "/users/1">>(true);
  });

  it.skip("should support wildcard", () => {
    assertType<ValidPathname<"/users/a/b/c", "/users/*">>(true);
  });

  it.skip("should support params and wildcard", () => {
    assertType<ValidPathname<"/users/a/b/c", "/users/:id/*">>(true);
  });
});

describe("ValidSearch", () => {
  it.skip("should return true", () => {
    assertType<ValidSearch<"sort=asc&size=2", { sort: string; size: string }>>(
      true
    );
  });
});
