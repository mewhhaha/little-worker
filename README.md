# Little router

Little router is a [Cloudflare Workers](https://developers.cloudflare.com/workers/)
router with a focus on type safety.

**This is an experimental router, the API may be updated regularly. Expect
breaking changes.**

## Packages

### little-router

[Documentation](./packages/little-router/README.md)

This is the main little router package, for simple use cases this will be all
you need. Allows you to create routing structures with a builder pattern.

This also includes the ability to create your own plugin.

### little-router/plugin-data

[Documentation](./packages/little-router-plugin-data/README.md)

A Little Router plugin that allows you to type body data on the request
handlers.

### little-router/plugin-query

[Documentation](./packages/little-router-plugin-query/README.md)

A Little Router plugin that allows you to type query data from the request URL.
