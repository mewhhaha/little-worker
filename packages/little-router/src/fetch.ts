export type Value = string | string[] | undefined;
export type Queries = Record<string, Value>;

export type FetchDefinition<
  METHOD extends string = string,
  PATTERN extends string = string,
  SEARCH extends Queries = Queries,
  INIT extends RequestInit | undefined = RequestInit | undefined,
  RESPONSE extends Response | undefined = Response
> = {
  method: METHOD;
  pattern: PATTERN;
  search: SEARCH;
  init: INIT;
  response: RESPONSE;
};
