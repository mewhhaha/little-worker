declare global {
  function fetch<T extends keyof Api["definitions"]>(
    url: T,
    ...init: undefined extends Api["definitions"][T]["init"]
      ? [init?: Api["definitions"][T]["init"]]
      : [init: Api["definitions"][T]["init"]]
  ): Promise<Api["definitions"][T]["response"]>;

  interface Api {
    definitions: any;
  }

  type ApiDefinition<
    T extends Record<string, { response: Response; init?: RequestInit }>
  > = T;
}

export {};
