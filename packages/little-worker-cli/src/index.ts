#!/usr/bin/env node

import yargs from "yargs";
import fs from "fs/promises";
import { hideBin } from "yargs/helpers";
import { main as generateRoutes } from "./generate-file-routes.js";

await yargs(hideBin(process.argv))
  .command(
    "routes",
    "CLI to generate routes and API in a little-worker project",
    (yargs) => {
      return yargs
        .option("target", {
          alias: "t",
          type: "string",
          description: "Target folder to generate router from",
          default: "app/routes",
        })
        .option("watch", {
          alias: "w",
          type: "boolean",
          description: "Watch for changes",
        });
    },
    async (argv) => {
      await generateRoutes(argv.target);

      if (argv.watch) {
        console.log("Watching for changes...");
        const watcher = fs.watch(argv.target);

        for await (const event of watcher) {
          switch (event.eventType) {
            case "rename": {
              await generateRoutes(argv.target);
            }
          }
        }
      }
    },
  )
  .parse();
