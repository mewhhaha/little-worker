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

export type JSONOf<T> = T extends JSONString<infer JSON>
  ? SerializedObject<JSON>
  : never;

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
