declare const self: any;
declare const global: any;
declare const window: any;

if (typeof self !== "undefined") {
  self.PATTERN = "";
} else if (typeof global !== "undefined") {
  global.PATTERN = "";
} else if (typeof window !== "undefined") {
  window.PATTERN = "";
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
