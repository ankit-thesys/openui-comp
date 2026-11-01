import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const args = process.argv.slice(2);
let selected;
const selectIndex = args.indexOf("--server");
if (selectIndex !== -1) {
  selected = args[selectIndex + 1];
  args.splice(selectIndex, 2);
}
if (
  args.length &&
  (args.length !== 2 || args[0] !== "--port" || Number(args[1]) !== manifest.compat.port)
) {
  throw new Error(`Use --port ${manifest.compat.port}; all matrix ports are fixed in package.json`);
}
const matrix = manifest.compat.servers ?? [
  { name: "turbopack-production", port: manifest.compat.port },
];
if (selected && !matrix.some(({ name }) => name === selected))
  throw new Error(`Unknown server: ${selected}`);
const servers = selected ? matrix.filter(({ name }) => name === selected) : matrix;
// Check every port before starting any child. Never silently choose another port.
for (const { port } of servers) {
  const probe = createServer();
  probe.listen(port, "127.0.0.1");
  await once(probe, "listening");
  await new Promise((resolve, reject) =>
    probe.close((error) => (error ? reject(error) : resolve())),
  );
}
const children = [];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill("SIGTERM");
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop(0));
for (const { name, port } of servers) {
  const [engine, runtime] = name.split("-");
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      runtime === "production" ? "start" : "dev",
      ...(runtime === "production" ? [] : [`--${engine}`]),
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      stdio: "inherit",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", OPENUI_COMPAT_SERVER: name },
    },
  );
  children.push(child);
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 1);
  });
}
