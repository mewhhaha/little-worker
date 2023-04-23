import { AcceptJSON } from "@mewhhaha/little-router";
import { error } from "@mewhhaha/typed-response";
import { Type } from "arktype";

export const check = <T, F extends AcceptJSON<T>>(parser: Type<T>, f: F): F => {
  const g = async (
    { request, ...context }: Parameters<F>[0],
    ...rest: unknown[]
  ) => {
    try {
      const t = await request.text();
      const r = parser(JSON.parse(t));
      if (r.problems) {
        return error(422, r.problems);
      }

      // TODO: Is this okay to mutate?
      request.text = async () => t;
      request.json = async () => r.data as T;

      return f(
        {
          ...context,
          request,
        },
        ...rest
      );
    } catch (err) {
      return error(400);
    }
  };

  return g as F;
};
