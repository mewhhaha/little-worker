import { AnyResponse } from "./types.js";

export type FetchDefinition<
  METHOD extends string = string,
  PATTERN extends string = string,
  SEARCH extends string | undefined = string | undefined,
  INIT extends RequestInit | undefined = RequestInit | undefined,
  RESPONSE extends AnyResponse | undefined = AnyResponse
> = {
  method: METHOD;
  pattern: PATTERN;
  search: SEARCH;
  init: INIT;
  response: RESPONSE;
};
