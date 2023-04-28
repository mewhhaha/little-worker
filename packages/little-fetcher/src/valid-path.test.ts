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
  it.skip("should return true", () => {
    assertType<ValidPathname<"/users/1/dogs/2", "/users/:id/dogs/:dog">>(true);
    assertType<ValidPathname<"/users/1", "/users/1">>(true);
  });
});

describe("ValidSearch", () => {
  it.skip("should return true", () => {
    assertType<ValidSearch<"sort=asc&size=2", { sort: string; size: string }>>(
      true
    );
  });
});
