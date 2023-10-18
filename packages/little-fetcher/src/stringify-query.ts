export type StringifyQuery<
  KEY extends string,
  VALUE,
> = NonNullable<VALUE> extends (infer R extends Interpolated)[]
  ? `${KEY}[]=${R}` | `${KEY}[]=?`
  : NonNullable<VALUE> extends Interpolated
  ? `${KEY}=${StringifyType<NonNullable<VALUE>>}`
  : never;

type StringifyType<VALUE extends Interpolated> = string extends VALUE
  ? "string"
  : `${number}` extends `${VALUE}`
  ? "0"
  : `${boolean}` extends `${VALUE}`
  ? "false"
  : VALUE;

type Interpolated = string | number | boolean | undefined | null;
