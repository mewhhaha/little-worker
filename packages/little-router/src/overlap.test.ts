import { describe, it, assertType } from "vitest";
import { HasOverlap } from "./overlap.js";

describe("HasOverlap", () => {
  it("should overlap", () => {
    assertType<HasOverlap<"/a", "/:id">>(true);
    assertType<HasOverlap<"/a", "/*">>(true);
    assertType<HasOverlap<"/a/b", "/*">>(true);
    assertType<HasOverlap<"/a/b", "*">>(true);
  });
  it("shouldn't overlap", () => {
    assertType<HasOverlap<"/:id", "/a">>(false);
    assertType<HasOverlap<"/a/b", "/:id">>(false);
    assertType<HasOverlap<"/a/:id/b", "/a/:id/c">>(false);
  });
});
