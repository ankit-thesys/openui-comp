import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { compatDir, repoDir, run, selectApps } from "./common.mjs";

// One stable name, so app manifests and lockfiles never change with library content. A
// non-frozen install re-reads a local tarball, so a rebuilt library is always installed.
export const TARBALL = "openui-react-components.tgz";
export const LIBRARY_SPEC = `file:../.pack/${TARBALL}`;

// The library's tarball integrity changes with every build; nothing else in a lockfile may.
const libraryIntegrity = new RegExp(
  `(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: ${LIBRARY_SPEC.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")})`,
  "g",
);
const comparable = (lockfile) => lockfile.replace(libraryIntegrity, "$1<library>$2");

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}

/**
 * Builds and packs the library, then installs it into each app. Third-party resolutions stay as
 * committed: the install fails if it would change anything but the library's integrity, and the
 * committed lockfile is restored afterwards, unless `updateLockfile` accepts the new one.
 */
export async function installLibrary(apps, { updateLockfile = false } = {}) {
  const libraryDir = join(repoDir, "packages/react-components");
  const packDir = join(compatDir, ".pack");
  await mkdir(packDir, { recursive: true });
  await run("pnpm", ["--filter", "@openuidev/react-components", "build"], repoDir);
  const temporary = join(packDir, "library.tgz");
  await run("pnpm", ["pack", "--out", temporary], libraryDir);
  await rename(temporary, join(packDir, TARBALL));

  for (const app of apps) {
    const appDir = join(compatDir, app);
    const manifest = JSON.parse(await readFile(join(appDir, "package.json"), "utf8"));
    const spec = manifest.dependencies?.["@openuidev/react-components"];
    if (spec !== LIBRARY_SPEC) {
      throw new Error(`${app}: depend on "@openuidev/react-components": "${LIBRARY_SPEC}"`);
    }
    const lockPath = join(appDir, "pnpm-lock.yaml");
    const committed = await readOptional(lockPath);
    if (committed === undefined && !updateLockfile) {
      throw new Error(
        `${app}: no pnpm-lock.yaml. Create it with install-library ${app} --update-lockfile`,
      );
    }
    let installed;
    try {
      // Unattended: without a TTY pnpm otherwise aborts when it must recreate node_modules.
      await run(
        "pnpm",
        ["install", "--no-frozen-lockfile", "--config.confirm-modules-purge=false"],
        appDir,
      );
      installed = await readFile(lockPath, "utf8");
    } finally {
      // Restored even when the install fails, so a run never leaves the lockfile modified.
      if (!updateLockfile) await writeFile(lockPath, committed);
    }
    if (updateLockfile) continue;
    if (comparable(installed) !== comparable(committed)) {
      const before = comparable(committed).split("\n");
      const after = comparable(installed).split("\n");
      const line = after.findIndex((text, index) => text !== before[index]);
      throw new Error(
        `${app}: the install would change pnpm-lock.yaml beyond the library's integrity ` +
          `(first difference at line ${line + 1}: "${after[line] ?? ""}"). ` +
          `If intended, run install-library ${app} --update-lockfile and commit the lockfile.`,
      );
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    const updateLockfile = args.includes("--update-lockfile");
    const names = args.filter((arg) => arg !== "--update-lockfile");
    if (names.length > 1 || names.some((name) => name.startsWith("--"))) {
      throw new Error("Usage: install-library.mjs [app|all] [--update-lockfile]");
    }
    await installLibrary(selectApps(names[0]), { updateLockfile });
  } catch (error) {
    console.error(error.message ?? error);
    process.exitCode = 1;
  }
}
