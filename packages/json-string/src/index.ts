declare global {
  interface JSON {
    stringify<T>(
      value: T,
      replacer?:
        | ((this: any, key: string, value: any) => any)
        | (string | number)[]
        | undefined
        | null,
      space?: string | number
    ): JSONString<T>;
  }
}

/** Wrapper around JSON.stringify that lets you autocomplete the parameters properly based on the return type */
export const JSONStringify = <T extends JSONString<any>>(
  value: T extends JSONString<infer U> ? U : never,
  replacer?:
    | ((this: any, key: string, value: any) => any)
    | (string | number)[]
    | undefined
    | null,
  space?: string | number
): T => {
  return JSON.stringify(value, replacer, space) as T;
};

export type JSONString<T> = string & {
  readonly __tag: unique symbol;
  readonly __value: SerializedObject<T>;
};

export type JSONOf<T> = T extends JSONString<infer JSON> ? JSON : never;

type Primitive = string | number | boolean | null | undefined;

type SerializedJSON<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? SerializedArray<U>
  : T extends Date
  ? string
  : T extends (...args: any[]) => any
  ? undefined
  : T extends object
  ? SerializedObject<T>
  : undefined;

type SerializedArray<T> = Array<SerializedJSON<T>>;

type SerializedObject<T> = {
  [P in keyof T]: T[P] extends Primitive ? T[P] : SerializedJSON<T[P]>;
};
