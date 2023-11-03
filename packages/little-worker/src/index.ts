export * from "@mewhhaha/json-string";
export * from "@mewhhaha/little-fetcher";
export * from "@mewhhaha/little-router";
export * from "@mewhhaha/typed-request";
export * from "@mewhhaha/typed-response";

declare const self: any;
declare const global: any;
declare const window: any;

/** Creates the global "PATTERN" variable for little-worker generated routes */
if (typeof self !== "undefined") {
  self.PATTERN = undefined;
} else if (typeof global !== "undefined") {
  global.PATTERN = undefined;
} else if (typeof window !== "undefined") {
  window.PATTERN = undefined;
}
