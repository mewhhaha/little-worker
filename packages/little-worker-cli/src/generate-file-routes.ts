#!/usr/bin/env node

import fs from "fs/promises";
import { format } from "prettier";

export const main = async (target: string) => {
  const files = await fs
    .readdir(target)
    .then((files) => files.filter(isRouteFile).toSorted(orderRoutes));

  const router = createRouter(files);

  await fs.writeFile(
    `${target}/_router.ts`,
    await format(router, { parser: "typescript" }),
  );
};

const unescapedDotRegex = /(?<!\[)\.(?![^[]*\])/g;

const tsRegex = /\.ts(x)?$/;

const dotRegex = /\./g;

const dollarRegex = /\$/g;

const methodRegex = /^(post)|(get)|(delete)|(put)|(options)|(all)|(patch)/;

const isRouteFile = (f: string) => f.match(methodRegex);

const createRouter = (files: string[]) => {
  const vars: Record<string, string> = {};
  for (let i = 0; i < files.length; i++) {
    vars[files[i]] = `route_${i}`;
  }

  const imports =
    "import { Router, type RouteData } from '@mewhhaha/little-worker';" +
    files.map((f) => `import ${vars[f]} from "./${fileToModule(f)}";`).join("");

  const declarations = `
    declare module "@mewhhaha/little-worker" {
      interface RouteData {
        "paths": ${files.map((f) => `"${fileToPath(f)}"`).join("|")};
      }
    }
  `;

  const routes = files
    .map((f) => {
      return `\t.${fileToMethod(f)}(${vars[f]}[0], ${vars[f]}[1], ${
        vars[f]
      }[2])`;
    })
    .join("\n");

  const type = `
    const routes = router.infer;
    export type Routes = typeof routes;
  `;

  const router =
    imports +
    `export const router = Router<RouteData["extra"] extends unknown[] ? RouteData["extra"] : []>()\n${routes};` +
    type +
    declarations;

  return router;
};

const fileToModule = (file: string) => file.replace(tsRegex, ".js");

const fileToMethod = (file: string) => file.match(methodRegex)?.[0] ?? "error";

export const fileToPath = (file: string) =>
  file
    .replace(tsRegex, "")
    .replace(methodRegex, "")
    .replace(dotRegex, "/")
    .replace(dollarRegex, ":");

const orderRoutes = (a: string, b: string): number => {
  // Each dot signifies another level of nesting
  const hierarchy =
    a.split(unescapedDotRegex).length - b.split(unescapedDotRegex).length;
  if (hierarchy === 0) {
    if (b.startsWith("$")) -1;
    return a < b ? -1 : 1;
  }

  return hierarchy;
};
