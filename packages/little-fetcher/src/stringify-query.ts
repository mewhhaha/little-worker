export type StringifyQuery<
  KEY extends string,
  VALUE,
> = NonNullable<VALUE> extends (infer R extends Interpolated)[]
  ? `${KEY}[]=${R}`
  : NonNullable<VALUE> extends Interpolated
  ? `${KEY}=${NonNullable<VALUE>}`
  : never;

type Interpolated = string | number | boolean | undefined | null;

export type StringifyQueryAutocomplete<
  KEY extends string,
  VALUE,
> = NonNullable<VALUE> extends (infer R extends Interpolated)[]
  ? `${KEY}[]=${StringifyType<R>}`
  : NonNullable<VALUE> extends Interpolated
  ? `${KEY}=${StringifyType<NonNullable<VALUE>>}`
  : never;

type StringifyType<VALUE extends Interpolated> = string extends VALUE
  ? "_"
  : `${number}` extends `${VALUE}`
  ? "0"
  : `${boolean}` extends `${VALUE}`
  ? "false"
  : VALUE;
