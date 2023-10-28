#!/usr/bin/env node

import { program } from "commander";
import { main as generateRoutes } from "./generate-file-routes.js";

program
  .name("little-worker")
  .description("CLI to generate routes and API in a little-worker project")
  .version(process.env.npm_package_version ?? "0");

program
  .command("routes")
  .description("Generate a routes and a router based on a file structure")
  .option(
    "-t, --target <string>",
    "target folder to generate routes from and router in",
    "app/routes"
  )
  .action(async (options: { target: string }) => {
    await generateRoutes(options.target);
  });

program
  .command("api")
  .description("Create a bundle of exported types")
  .argument("<string>", "target entry point to base exports off of")
  .action(() => {
    console.log("api");
  });

program.parse();
