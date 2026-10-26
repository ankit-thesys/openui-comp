import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

// Use the same workspace selection as build:packages, including nested kits.
// pnpm ignores organizational directories that do not contain a manifest.
export const workspacePackages = () => {
  const packages = JSON.parse(
    execFileSync("pnpm", ["--filter", "./packages/**", "list", "--depth", "-1", "--json"], {
      encoding: "utf8",
    }),
  );
  return packages.map((pkg) => ({
    dir: relative(process.cwd(), pkg.path).split(sep).join("/"),
    manifest: JSON.parse(readFileSync(join(pkg.path, "package.json"), "utf8")),
  }));
};
