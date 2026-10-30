import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { compatDir, ports, run, selectApps } from "./common.mjs";
import { installLibrary } from "./install-library.mjs";

const servers = new Set();
let interrupted = false;

function killGroup(child, signal) {
  try {
    // Kill pnpm and its framework child together; otherwise the port can stay occupied.
    if (child.pid) process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

async function stop(child) {
  killGroup(child, "SIGTERM");
  // Poll the process group too: the pnpm parent can exit before its framework child.
  for (let i = 0; i < 50; i++) {
    try {
      process.kill(-child.pid, 0);
    } catch (error) {
      if (error.code === "ESRCH") {
        servers.delete(child);
        return;
      }
      throw error;
    }
    await delay(100);
  }
  killGroup(child, "SIGKILL");
  servers.delete(child);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    interrupted = true;
    process.exitCode = signal === "SIGINT" ? 130 : 143;
    for (const child of servers) killGroup(child, "SIGTERM");
  });
}

async function assertFree(port) {
  const probe = createServer();
  probe.listen(port, "127.0.0.1");
  await once(probe, "listening");
  await new Promise((resolve, reject) =>
    probe.close((error) => (error ? reject(error) : resolve())),
  );
}

async function waitReady(child, url, startup) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (interrupted) throw new Error("Interrupted");
    if (startup.error) throw startup.error;
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `Production server exited before readiness: ${child.exitCode ?? child.signalCode}`,
      );
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      await response.body?.cancel();
      if (response.ok) return;
    } catch {
      // The child may not have bound its socket yet.
    }
    await delay(200);
  }
  throw new Error(`Production server was not ready within 60s: ${url}`);
}

async function runApp(app, requestedMode, listTests) {
  const cwd = join(compatDir, app);
  const manifest = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
  const supported = manifest.compat?.modes ?? ["unlayered", "layered"];
  const modes = requestedMode === "both" ? supported : [requestedMode];
  const rows = [];
  for (const mode of modes) {
    const row = { app, mode, port: ports[app], result: "FAIL", stage: "build" };
    let child;
    try {
      if (interrupted) throw new Error("Interrupted");
      if (!supported.includes(mode)) throw new Error(`Unsupported mode: ${mode}`);
      const env = { OPENUI_COMPAT_MODE: mode, PORT: String(ports[app]) };
      await run("pnpm", ["run", "build"], cwd, env);
      row.stage = "start";
      await assertFree(ports[app]);
      child = spawn("pnpm", ["run", "start", "--port", String(ports[app])], {
        cwd,
        env: { ...process.env, ...env },
        stdio: "inherit",
        detached: true,
      });
      servers.add(child);
      const startup = { error: undefined };
      child.on("error", (error) => (startup.error = error));
      await waitReady(child, `http://127.0.0.1:${ports[app]}/`, startup);
      row.stage = listTests ? "list tests (no browser)" : "smoke";
      await run("pnpm", ["run", "test:smoke", ...(listTests ? ["--list"] : [])], cwd, env);
      row.result = "PASS";
    } catch (error) {
      console.error(`[${app}/${mode}] ${error.message}`);
    } finally {
      if (child) {
        try {
          await stop(child);
        } catch (error) {
          row.result = "FAIL";
          row.stage = "stop";
          console.error(error);
        }
      }
    }
    rows.push(row);
  }
  return rows;
}

try {
  const args = process.argv.slice(2);
  const name = args[0] && !args[0].startsWith("--") ? args.shift() : "all";
  const modeFlag = args.find((arg) => arg.startsWith("--mode="));
  const mode = modeFlag?.slice("--mode=".length) ?? "both";
  if (
    !["both", "unlayered", "layered"].includes(mode) ||
    args.some((arg) => arg !== "--list-tests" && arg !== modeFlag)
  ) {
    throw new Error("Usage: run.mjs [app|all] [--mode=both|unlayered|layered] [--list-tests]");
  }
  const apps = selectApps(name);
  let rows;
  try {
    await installLibrary(apps);
    rows = (
      await Promise.all(apps.map((app) => runApp(app, mode, args.includes("--list-tests"))))
    ).flat();
  } catch (error) {
    console.error(error);
    rows = apps.map((app) => ({ app, mode, port: ports[app], result: "FAIL", stage: "install" }));
  }
  console.table(rows);
  if (rows.some((row) => row.result !== "PASS")) process.exitCode ||= 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await Promise.all([...servers].map(stop));
}
