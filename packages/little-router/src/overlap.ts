type split_url_pattern<pattern> = pattern extends `/${infer segment extends
  string}/${infer rest extends string}`
  ? [parameterize<segment>, ...split_url_pattern<`/${rest}`>]
  : pattern extends `/*`
  ? [...string[]]
  : pattern extends `/${infer segment extends string}`
  ? [parameterize<segment>]
  : never;

type parameterize<segment> = segment extends `:${string}` ? string : segment;

export type is_overlapping<
  routes extends string,
  route extends string,
> = routes extends any
  ? Extract<split_url_pattern<route>, split_url_pattern<routes>> extends never
    ? false
    : `${routes} overlaps with ${route}`
  : never;
