type Route = [pattern: string, init: RequestInit, response: Response];

declare global {
  function fetch<T extends Route>(url: T[0], init: T[1]): Promise<T[2]>;
}

export {};
