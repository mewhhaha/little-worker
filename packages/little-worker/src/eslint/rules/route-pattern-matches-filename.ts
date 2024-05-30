import { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/utils";
import path, { basename, dirname } from "path";
import { fileToPath } from "@mewhhaha/little-worker-cli/api";

type Options = {
  target?: string;
};

const rule: RuleModule<"mismatchPath", [Options?]> = {
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
  defaultOptions: [{ target: path.join("app", "routes") }],
  create(context) {
    const { target = path.join("app", "routes") } = context.options[0] ?? {};

    const filename = context.filename;
    const id = getId(filename);
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

        if (isNotInRoutesFolder(filename, target)) return;
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

const getId = (filename: string) => {
  if (filename.endsWith("route.tsx")) {
    filename = dirname(filename);
  }

  return basename(filename, ".tsx");
};

const isNotInRoutesFolder = (filename: string, folder: string) => {
  if (filename.endsWith("route.tsx")) {
    filename = dirname(filename);
  }
  return !dirname(filename).endsWith(folder);
};

const isNotRouteFunction = (callExpression: TSESTree.CallExpression) => {
  if (callExpression.callee.type !== "Identifier") return true;
  if (callExpression.callee.name !== "route") return true;

  return false;
};
