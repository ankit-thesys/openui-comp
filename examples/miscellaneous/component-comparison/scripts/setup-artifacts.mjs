import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { localArchives } from "./archive-paths.mjs";
const here = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await fs.readFile(path.join(here, "package.json"), "utf8"),
);
const from = process.argv.find((x) => x.startsWith("--from="))?.slice(7);
for (const archive of localArchives(manifest)) {
  const destination = path.resolve(here, archive.path);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  if (from) {
    await fs.copyFile(path.join(from, path.basename(destination)), destination);
  } else {
    const result = spawnSync(
      "pnpm",
      [
        "--filter",
        archive.name,
        "--fail-if-no-match",
        "pack",
        "--pack-destination",
        path.dirname(destination),
      ],
      {
        cwd: path.resolve(here, "../../.."),
        env: { ...process.env, npm_config_ignore_scripts: "true" },
        stdio: "inherit",
      },
    );
    if (result.status !== 0)
      throw Error(
        `Pack failed: ${archive.name}. Build packages first; see README.`,
      );
  }
}
console.log("Packed artifacts ready. Run npm install, then npm run generate.");
