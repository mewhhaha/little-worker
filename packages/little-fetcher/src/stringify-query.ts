export type StringifyQuery<
  KEY extends string,
  VALUE
> = NonNullable<VALUE> extends (infer R extends string)[]
  ? `${KEY}[]=${R}`
  : NonNullable<VALUE> extends string
  ? `${KEY}=${NonNullable<VALUE>}`
  : never;
