/**
 * Function to assert invariants in the code.
 *
 * @example
 * invariant(1 === 1, "1 is always equal to 1")
 */
export function invariant<T>(
  condition: T,
  expected: string
): asserts condition {
  if (!condition) {
    const error = new Error(expected);
    error.name = "Invariant Violation";
    throw error;
  }
}
