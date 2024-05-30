import config from "@mewhhaha/config/eslint-config";
import worker from "@mewhhaha/little-worker/eslint-plugin";

export default [
  { ignores: [".wrangler", ".turbo", "node_modules", "dist"] },
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  worker.configs.recommended,
  ...config,
];
