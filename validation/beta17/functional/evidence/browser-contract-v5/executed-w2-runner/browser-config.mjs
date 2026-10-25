import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

const isOutside = (relative) =>
  relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);

export async function browserBundleInventory(bundlePath) {
  const realRoot = await fs.realpath(bundlePath);
  const files = {};
  const symlinks = {};
  async function walk(directory) {
    for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile())
        files[file] = createHash("sha256")
          .update(await fs.readFile(file))
          .digest("hex");
      else if (entry.isSymbolicLink()) {
        if (isOutside(path.relative(realRoot, await fs.realpath(file))))
          throw new Error(`Browser bundle symlink escapes its root: ${file}`);
        symlinks[path.relative(bundlePath, file).split(path.sep).join("/")] =
          await fs.readlink(file);
      } else throw new Error(`Unexpected browser bundle entry: ${file}`);
    }
  }
  await walk(bundlePath);
  return { files, symlinks };
}

export async function browserLaunchOptions(manifest) {
  const browser = manifest.browser;
  if (
    !browser ||
    browser.name !== "chrome-for-testing" ||
    !/^\d+\.\d+\.\d+\.\d+$/.test(browser.version) ||
    !browser.platform ||
    !path.isAbsolute(browser.executablePath ?? "") ||
    !/^[a-f0-9]{64}$/.test(browser.executableSha256 ?? "")
  )
    throw new Error("Complete pinned Chrome for Testing identity is required");
  const official = `https://storage.googleapis.com/chrome-for-testing-public/${browser.version}/${browser.platform}/chrome-${browser.platform}.zip`;
  if (browser.source !== official)
    throw new Error("Browser source must match the official pinned distribution");
  if (manifest.inputs?.[browser.executablePath] !== browser.executableSha256)
    throw new Error("Pinned browser missing or different in frozen input inventory");
  const actual = createHash("sha256")
    .update(await fs.readFile(browser.executablePath))
    .digest("hex");
  if (actual !== browser.executableSha256)
    throw new Error("Pinned browser executable hash changed");
  if (
    !path.isAbsolute(browser.bundlePath ?? "") ||
    !browser.bundleSymlinks ||
    isOutside(
      path.relative(
        await fs.realpath(browser.bundlePath),
        await fs.realpath(browser.executablePath),
      ),
    )
  )
    throw new Error("Pinned executable must belong to its declared browser bundle");
  const bundle = await browserBundleInventory(browser.bundlePath);
  const frozenFiles = Object.fromEntries(
    Object.entries(manifest.inputs ?? {}).filter(
      ([file]) => !isOutside(path.relative(browser.bundlePath, file)),
    ),
  );
  if (!isDeepStrictEqual(bundle.files, frozenFiles))
    throw new Error("Browser bundle files changed or are missing from the frozen inventory");
  if (!isDeepStrictEqual(bundle.symlinks, browser.bundleSymlinks))
    throw new Error("Browser bundle symlinks changed");
  return { executablePath: browser.executablePath, headless: true };
}
