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

const splatRegex = /\$$/g;

const methodRegex = /^(post)|(get)|(delete)|(put)|(options)|(all)|(patch)/;

const isRouteFile = (f: string) => f.match(methodRegex);

const generateVar = (name: string) =>
  `route_${Buffer.from(name).toString("base64").replaceAll("=", "")}`;

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

const fileToModule = (file: string) => {
  if (file.match(tsRegex)) {
    return file.replace(tsRegex, ".js");
  }

  // Assume it's a folder if it doesn't have an extension
  return `${file}/route.js`;
};

const fileToMethod = (file: string) => file.match(methodRegex)?.[0] ?? "error";

export const fileToPath = (file: string) =>
  file
    .replace(tsRegex, "")
    .replace(methodRegex, "")
    .replace(dotRegex, "/")
    .replace(splatRegex, "*")
    .replace(dollarRegex, ":");

export const orderRoutes = (a: string, b: string): number => {
  if (a.match(tsRegex)) {
    a = a.replace(tsRegex, "");
  }

  if (b.match(tsRegex)) {
    b = b.replace(tsRegex, "");
  }

  const aSegments = a.split(unescapedDotRegex);
  const bSegments = b.split(unescapedDotRegex);

  const aMethod = aSegments[0];
  const bMethod = bSegments[0];

  if (aMethod !== bMethod) {
    return methodOrder[aMethod] - methodOrder[bMethod];
  }

  // Each dot signifies another level of nesting
  const hierarchy = bSegments.length - aSegments.length;
  if (hierarchy === 0) {
    return b < a ? -1 : 1;
  }

  return hierarchy;
};

// Rank options and get higher so they're more accessible
// this assumes that reads happen more often than other methods
// but I guess the difference isn't gonna be that huge either way
const methodOrder: Record<string, number> = {
  options: 0,
  get: 1,
  post: 2,
  put: 3,
  delete: 4,
  patch: 5,
  all: 6,
};
