import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

export async function installedInventory(consumer) {
  const require = createRequire(path.join(consumer, "package.json"));
  const inventory = {};
  const installedRoot = await fs.realpath(path.join(consumer, "node_modules"));
  async function include(file) {
    inventory[file] = createHash("sha256")
      .update(await fs.readFile(file))
      .digest("hex");
  }
  async function tree(directory) {
    for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await tree(file);
      else if (entry.isFile()) await include(file);
      else throw new Error(`Unexpected non-file in installed dist: ${file}`);
    }
  }
  for (const [specifier, name] of [
    ["@openuidev/react-ui-core", "@openuidev/react-ui-core"],
    ["@openuidev/kits/react/chat", "@openuidev/kits"],
  ]) {
    const entry = await fs.realpath(require.resolve(specifier));
    const installedRelative = path.relative(installedRoot, entry);
    if (installedRelative.startsWith("..") || path.isAbsolute(installedRelative))
      throw new Error(`${name} resolves outside frozen consumer node_modules`);
    let root = path.dirname(entry);
    while (true) {
      const manifest = path.join(root, "package.json");
      let parsed;
      try {
        parsed = JSON.parse(await fs.readFile(manifest, "utf8"));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (parsed?.name === name) {
        const relative = path.relative(path.join(root, "dist"), entry);
        if (relative.startsWith("..") || path.isAbsolute(relative))
          throw new Error(`${name} resolves outside installed dist`);
        await include(manifest);
        await tree(path.join(root, "dist"));
        break;
      }
      const parent = path.dirname(root);
      if (parent === root) throw new Error(`Could not find installed manifest for ${name}`);
      root = parent;
    }
  }
  await include(path.join(consumer, "package.json"));
  const locks = (await fs.readdir(consumer)).filter((name) =>
    ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "npm-shrinkwrap.json"].includes(name),
  );
  if (locks.length !== 1) throw new Error("Expected exactly one frozen consumer lockfile");
  await include(path.join(consumer, locks[0]));
  return inventory;
}
