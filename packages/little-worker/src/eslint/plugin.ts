import routePatternMatchesfilename from "./rules/route-pattern-matches-filename.js";

const plugin = {
  rules: {
    "route-pattern-matches-filename": routePatternMatchesfilename,
  },
} as const;

const name = "little-worker";

// Provides autocomplete when defining the plugin rules
type PluginRules = {
  [key in `${typeof name}/${keyof (typeof plugin)["rules"]}`]: "error" | "warn";
};

const configs = {
  recommended: {
    plugins: {
      [name]: plugin,
    },
    rules: {
      "little-worker/route-pattern-matches-filename": "error",
    } satisfies PluginRules,
  },
} as const;

export default { plugin, configs };
