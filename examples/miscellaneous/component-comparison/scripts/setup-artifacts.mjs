import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
const here = path.resolve(import.meta.dirname, "..");
const packages = [
  "lang-core",
  "observability",
  "devtools",
  "react-lang",
  "react-ui",
  "react-ui-core",
  "kits",
];
await fs.mkdir(path.join(here, ".artifacts"), { recursive: true });
const from = process.argv.find((x) => x.startsWith("--from="))?.slice(7);
if (from) {
  for (const name of packages) {
    const manifest = JSON.parse(
      await fs.readFile(path.join(here, "package.json"), "utf8"),
    );
    const filename = path.basename(
      manifest.dependencies[`@openuidev/${name}`].slice("file:".length),
    );
    await fs.copyFile(
      path.join(from, filename),
      path.join(here, ".artifacts", filename),
    );
  }
} else {
  const repo = path.resolve(here, "../../..");
  for (const name of packages) {
    const result = spawnSync(
      "pnpm",
      [
        "--filter",
        `@openuidev/${name}`,
        "pack",
        "--pack-destination",
        path.join(here, ".artifacts"),
      ],
      {
        cwd: repo,
        env: { ...process.env, npm_config_ignore_scripts: "true" },
        stdio: "inherit",
      },
    );
    if (result.status !== 0)
      throw Error(`Pack failed: ${name}. Build packages first; see README.`);
  }
}
console.log("Packed artifacts ready. Run npm install, then npm run generate.");
