import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const compatDir = fileURLToPath(new URL("../", import.meta.url));
export const repoDir = fileURLToPath(new URL("../../../../", import.meta.url));
// Ports for the planned Tier 1 apps (README, "Ports"). Each app declares its own port in its
// package.json, so apps added in parallel never edit a shared table.
export const PORT_RANGE = [5700, 5799];

// Every app directory: one whose package.json declares `compat.port`.
async function discover() {
  const found = {};
  for (const entry of await readdir(compatDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || ["node_modules", "scripts", "shared"].includes(entry.name))
      continue;
    if (entry.name.startsWith(".")) continue;
    let manifest;
    try {
      manifest = JSON.parse(await readFile(join(compatDir, entry.name, "package.json"), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    const port = manifest.compat?.port;
    if (!/^[a-z][a-z0-9-]*$/.test(entry.name) || !Number.isInteger(port)) {
      throw new Error(`${entry.name}/package.json needs an integer "compat": { "port" }`);
    }
    if (port < PORT_RANGE[0] || port > PORT_RANGE[1]) {
      throw new Error(`${entry.name}: port ${port} is outside ${PORT_RANGE.join("-")}`);
    }
    const taken = Object.entries(found).find(([, other]) => other === port);
    if (taken) throw new Error(`Port ${port} is declared by both ${taken[0]} and ${entry.name}`);
    found[entry.name] = port;
  }
  return found;
}

export const ports = await discover();

export function selectApps(name = "all") {
  if (name !== "all" && !Object.hasOwn(ports, name)) {
    throw new Error(`Unknown app ${name}. Choose: ${Object.keys(ports).join(", ")}, all`);
  }
  return name === "all" ? Object.keys(ports).sort() : [name];
}

export function run(command, args, cwd, env = {}) {
  console.log(`\n[${cwd}] ${command} ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${signal ?? code}`));
    });
  });
}
