declare global {
  interface JSON {
    stringify<T>(
      value: T,
      replacer?: null,
      space?: string | number
    ): JSONString<T>;
  }
}

export type JSONString<T> = string & {
  readonly __tag: unique symbol;
  readonly __value: T;
};
