#!/usr/bin/env node

import fs from "fs/promises";
import { format } from "prettier";

const tsRegex = /\.ts(x)?$/;

const dotRegex = /\./g;

const dollarRegex = /\$/g;

const methodRegex = /^(post)|(get)|(delete)|(put)|(options)|(all)|(patch)/;

const isRouteFile = (f: string) => f.match(methodRegex);

const createPattern = (files: string[]) => {
  const global = `
    if (typeof self !== "undefined") {
      (self as any).PATTERN = "";
    } else if (typeof global !== "undefined") {
      (global as any).PATTERN = "";
    } else if (typeof window !== "undefined") {
      (window as any).PATTERN = "";
    }
  `;

  const declarations = files
    .map((f) => {
      return `declare module "./${fileToModule(f)}" { 
        /** This is an ephemeral value and can only be used as a type */
        const PATTERN = "${fileToPath(f)}" 
      }`;
    })
    .join("");

  return global + declarations + "export {};";
};

const createRouter = (files: string[]) => {
  const vars: Record<string, string> = {};
  for (let i = 0; i < files.length; i++) {
    vars[files[i]] = `route_${i}`;
  }
  const imports =
    "import { Router, type RouteData } from '@mewhhaha/little-worker';" +
    "import * as PATTERN from './_pattern.js';" +
    files.map((f) => `import ${vars[f]} from "./${fileToModule(f)}";`).join("");

  const routes = files
    .map((f) => {
      return `\t.${fileToMethod(f)}("${fileToPath(f)}", ${vars[f]}[1], ${
        vars[f]
      }[2])`;
    })
    .join("\n");

  const pattern = `if (typeof PATTERN === "undefined") {
      throw new Error("missing PATTERN import");
    }`;

  const type = `
    const routes = router.infer;
    export type Routes = typeof routes;
  `;

  const router =
    imports +
    pattern +
    `export const router = Router<RouteData["arguments"] extends unknown[] ? RouteData["arguments"] : []>()\n${routes};` +
    type;

  return router;
};

const fileToModule = (file: string) => file.replace(tsRegex, ".js");

const fileToMethod = (file: string) => file.match(methodRegex)?.[0] ?? "error";

const fileToPath = (file: string) =>
  file
    .replace(tsRegex, "")
    .replace(methodRegex, "")
    .replace(dotRegex, "/")
    .replace(dollarRegex, ":");

export const main = async (target: string) => {
  const files = await fs
    .readdir(target)
    .then((files) => files.filter(isRouteFile).sort());

  const pattern = createPattern(files);
  const router = createRouter(files);

  const writePattern = fs.writeFile(
    `${target}/_pattern.ts`,
    await format(pattern, { parser: "typescript" })
  );

  const writeRouter = await fs.writeFile(
    `${target}/_router.ts`,
    await format(router, { parser: "typescript" })
  );

  await Promise.all([writePattern, writeRouter]);
};
