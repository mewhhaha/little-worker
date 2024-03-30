import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    globals: true,
    poolOptions: {
      workers: {
        miniflare: {
          compatibilityFlags: ["nodejs_compat"],
          compatibilityDate: "2023-10-28",
        },
      },
    },
  },
});
