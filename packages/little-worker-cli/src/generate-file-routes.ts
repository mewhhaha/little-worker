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

const generateVar = (name: string) =>
  `route_${Buffer.from(name).toString("base64").replace("=", "")}`;

const createRouter = (files: string[]) => {
  const vars: Record<string, string> = {};
  for (let i = 0; i < files.length; i++) {
    vars[files[i]] = generateVar(files[i]);
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
      return `\t.${fileToMethod(f)}(...${vars[f]})`;
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

export const orderRoutes = (a: string, b: string): number => {
  // Each dot signifies another level of nesting
  const hierarchy =
    b.split(unescapedDotRegex).length - a.split(unescapedDotRegex).length;
  if (hierarchy === 0) {
    return b < a ? -1 : 1;
  }

  return hierarchy;
};
