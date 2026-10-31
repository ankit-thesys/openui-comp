import { spawn } from "node:child_process";
import manifest from "./package.json" with { type: "json" };
const args = process.argv.slice(2);
if (
  args.length &&
  (args.length !== 2 || args[0] !== "--port" || Number(args[1]) !== manifest.compat.port)
) {
  throw new Error(`Use --port ${manifest.compat.port}`);
}
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(manifest.compat.port),
  ],
  { stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
