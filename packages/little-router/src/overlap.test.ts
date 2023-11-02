import { describe, it, assertType } from "vitest";
import { is_overlapping } from "./overlap.js";

describe("HasOverlap", () => {
  it("shouldn't  overlap", () => {
    assertType<is_overlapping<"/a", "/:id">>(false);
    assertType<is_overlapping<"/a", "/*">>(false);
    assertType<is_overlapping<"/a/b", "/*">>(false);
    assertType<is_overlapping<"/a/b", "*">>(false);
    assertType<is_overlapping<"/a/b", "/:id">>(false);
    assertType<is_overlapping<"/a/:id/b", "/a/:id/c">>(false);
    assertType<is_overlapping<"/a-a", "/b-b">>(false);
    assertType<is_overlapping<"/b-b", "/a-a">>(false);
  });
  it("should overlap", () => {
    assertType<is_overlapping<"/:id", "/a">>("/:id overlaps with /a");
    assertType<is_overlapping<"/:id/:bid", "/a/b">>(
      "/:id/:bid overlaps with /a/b"
    );
    assertType<is_overlapping<"/*", "/a/b">>("/* overlaps with /a/b");
  });
});
