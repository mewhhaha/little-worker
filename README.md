# Little Worker

Little worker is a bundle of small packages to more easily create [Cloudflare Workers](https://developers.cloudflare.com/workers/).

[Documentation](./packages/little-worker/README.md)

**These are all experimental packages, the API may be updated regularly. Expect
breaking changes.**

## Packages

### little-router

[Documentation](./packages/little-router/README.md)

Little router is a [Cloudflare Workers](https://developers.cloudflare.com/workers/)
router with a focus on type safety. For simple use cases this will be all
you need. Allows you to create routing structures with a builder pattern.

This also includes the ability to create your own plugin.

### little-fetcher

[Documentation](./packages/little-fetcher/README.md)

This is a fetch wrapper that consumes routes created by `little-router`. It can either be a wrapper around the `fetch` API or any object with the shape `{ fetch: Fetch }`. The latter is for example the shape of a `Durable Object` stub.

### little-router/plugin-data

[Documentation](./packages/little-router-plugin-data/README.md)

A Little Router plugin that allows you to type body data on the request
handlers.

### little-router/plugin-query

[Documentation](./packages/little-router-plugin-query/README.md)

A Little Router plugin that allows you to type query data from the request URL.
