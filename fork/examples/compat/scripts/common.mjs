import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const compatDir = fileURLToPath(new URL("../", import.meta.url));
export const repoDir = fileURLToPath(new URL("../../../../", import.meta.url));
export const ports = JSON.parse(await readFile(new URL("../ports.json", import.meta.url), "utf8"));

export function selectApps(name = "all") {
  if (name !== "all" && !Object.hasOwn(ports, name)) {
    throw new Error(`Unknown app ${name}. Choose: ${Object.keys(ports).join(", ")}, all`);
  }
  const entries = Object.entries(ports);
  const allocated = new Set();
  for (const [app, port] of entries) {
    if (!/^[a-z][a-z0-9-]*$/.test(app) || !Number.isInteger(port) || port < 5700 || port > 65535) {
      throw new Error(`Invalid port table entry: ${app}=${port}`);
    }
    if (allocated.has(port)) throw new Error(`Port ${port} is allocated twice`);
    allocated.add(port);
  }
  return name === "all" ? entries.map(([app]) => app) : [name];
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
