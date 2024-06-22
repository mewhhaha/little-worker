import { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/utils";
import path, { basename, dirname } from "path";
import { fileToPath } from "@mewhhaha/little-worker-cli/api";
import { type } from "arktype";

const rule: RuleModule<"mismatchPath", []> = {
  meta: {
    fixable: "code",
    messages: {
      mismatchPath:
        "Mismatching pattern for `route`, should be '{{ argument }}'",
    },
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          app: {
            type: "string",
          },
        },
      },
    ],
    docs: {
      description:
        "Rule for ensuring that the generic passed to the `useParams` function matches the filename if the file is a route file.",
    },
  },
  defaultOptions: [],
  create(context) {
    const settings = parseSettings(context.settings?.littleWorker);
    const target =
      settings instanceof type.errors
        ? path.join("app", "routes") // Default target
        : settings.target;

    const filename = context.filename;
    const id = getId(filename, target);
    const correctPattern = fileToPath(id);

    const mismatchPatternError = (
      callExpressionArgument: TSESTree.CallExpressionArgument,
    ) => {
      context.report({
        node: callExpressionArgument,
        messageId: "mismatchPath",
        data: { argument: correctPattern },
        fix: (fixer) => {
          return fixer.replaceText(
            callExpressionArgument,
            `"${correctPattern}"`,
          );
        },
      });
    };

    return {
      CallExpression: function lintUseParamsUsage(
        callExpression: TSESTree.CallExpression,
      ) {
        const firstArgument = callExpression.arguments[0];

        if (isNotRouteFile(filename, target)) return;
        if (isNotRouteFunction(callExpression)) return;

        if (firstArgument === undefined) return;
        if (firstArgument.type !== "Literal") return;

        if (firstArgument.value !== correctPattern) {
          mismatchPatternError(firstArgument);
        }

        // Hooray! Generic is correct!
        return;
      },
    };
  },
};

export default rule;

const getId = (filename: string, folder: string) => {
  const trimmed = path.relative(folder, filename);

  if (path.dirname(trimmed) === ".") {
    return basename(trimmed).replace(/\.ts(x)?$/, "");
  }

  return dirname(trimmed);
};

const isNotRouteFile = (filename: string, folder: string) => {
  if (basename(filename).startsWith("_")) return true;
  const trimmed = path.relative(folder, filename);
  if (trimmed.startsWith("..")) return true;

  if (path.dirname(trimmed) === ".") return false;
  if (path.basename(trimmed).startsWith("route.")) return false;

  return false;
};

const isNotRouteFunction = (callExpression: TSESTree.CallExpression) => {
  if (callExpression.callee.type !== "Identifier") return true;
  if (callExpression.callee.name !== "route") return true;

  return false;
};

const parseSettings = type({
  target: "string",
});
