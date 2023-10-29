/**
 * Tagging types so that they can be distinguished from each other even within the same type.
 * This will block you from accidentally passing a `string` where a `DateISOString` is expected.
 * However if the function takes a the general type, it's completely valid to pass in the tagged type.
 * @example
 * type DateISOString = TaggedType<string, "date_string">;
 * const dateString = new Date().toISOString() as DateISOString
 *
 * const f = (value: DateISOString) => value
 *
 * f("hello there") // error
 * f(dateString) // success
 */
export type TaggedType<T, Z extends string> = Tag<Z> & T;

export interface Tag<T> {
  readonly __tag: T;
}
