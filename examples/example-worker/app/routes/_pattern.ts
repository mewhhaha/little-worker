if (typeof self !== "undefined") {
  (self as any).PATTERN = "";
} else if (typeof global !== "undefined") {
  (global as any).PATTERN = "";
} else if (typeof window !== "undefined") {
  (window as any).PATTERN = "";
}
declare module "./get.example-get.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-get";
}
declare module "./get.example-query-params.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-query-params";
}
declare module "./post.example-advanced.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-advanced";
}
declare module "./post.example-post.$id.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-post/:id";
}
declare module "./post.example-post.js" {
  /** This is an ephemeral value and can only be used as a type */
  const PATTERN = "/example-post";
}
export {};
