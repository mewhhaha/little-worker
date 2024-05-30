#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { main as generateRoutes } from "./generate-file-routes.js";

await yargs(hideBin(process.argv))
  .command(
    "routes",
    "CLI to generate routes and API in a little-worker project",
    (yargs) => {
      return yargs.option("target", {
        alias: "t",
        type: "string",
        description: "Target folder to generate router from",
        default: "app/routes",
      });
    },
    async (argv) => {
      await generateRoutes(argv.target);
    },
  )
  .parse();
