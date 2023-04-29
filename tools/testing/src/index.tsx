/** Mock router as fetch */
export const fromRouter = <
  R extends { handle: (request: Request) => Promise<Response> | Response }
>(
  r: R
): { fetch: typeof fetch } => ({
  fetch: async (url, init) => {
    const request = new Request(url, init);
    return r.handle(request);
  },
});
