import config from "@mewhhaha/config/eslint-config";

export default [
  ...config,
  { ignores: [".wrangler", ".turbo", "node_modules", "dist"] },
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
