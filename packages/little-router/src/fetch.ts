import { AnyResponse } from "./types.js";

export type Query = [string, string | string[] | undefined];
export type Queries = [Query, ...Query[]];

export type FetchDefinition<
  METHOD extends string = string,
  PATTERN extends string = string,
  SEARCH extends Queries = Queries,
  INIT extends RequestInit | undefined = RequestInit | undefined,
  RESPONSE extends AnyResponse | undefined = AnyResponse
> = {
  method: METHOD;
  pattern: PATTERN;
  search: SEARCH;
  init: INIT;
  response: RESPONSE;
};
