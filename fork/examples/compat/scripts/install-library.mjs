import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { compatDir, repoDir, run, selectApps } from "./common.mjs";

export async function installLibrary(apps) {
  const libraryDir = join(repoDir, "packages/react-components");
  const packDir = join(compatDir, ".pack");
  await mkdir(packDir, { recursive: true });
  await run("pnpm", ["--filter", "@openuidev/react-components", "build"], repoDir);
  const temporary = join(packDir, "library.tgz");
  await run("pnpm", ["pack", "--out", temporary], libraryDir);
  const hash = createHash("sha256")
    .update(await readFile(temporary))
    .digest("hex");
  // A content-addressed name prevents pnpm from reusing a stale local-tarball resolution.
  const tarball = join(packDir, `openui-react-components-${hash.slice(0, 16)}.tgz`);
  await rename(temporary, tarball);

  for (const app of apps) {
    const appDir = join(compatDir, app);
    const manifestPath = join(appDir, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.dependencies ??= {};
    manifest.dependencies["@openuidev/react-components"] =
      `file:${relative(dirname(manifestPath), tarball).split("\\").join("/")}`;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await run("pnpm", ["install", "--no-frozen-lockfile"], appDir);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length > 3) throw new Error("Usage: install-library.mjs [app|all]");
    await installLibrary(selectApps(process.argv[2]));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
