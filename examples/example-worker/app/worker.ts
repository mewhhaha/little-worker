import { router } from "./routes/_router.js";
export { type Routes } from "./routes/_router.js";

const handler: ExportedHandler = {
  fetch: router.all("/*", [], () => new Response("Not found", { status: 404 }))
    .handle,
};

export default handler;
