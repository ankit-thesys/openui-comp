import { spawnSync } from "node:child_process";
const engines = ["turbopack", "webpack"];
for (const engine of engines) {
  const result = spawnSync(
    process.execPath,
    ["node_modules/next/dist/bin/next", "build", `--${engine}`],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        OPENUI_COMPAT_SERVER: `${engine}-production`,
      },
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const check = spawnSync("pnpm", ["typecheck"], { stdio: "inherit" });
process.exit(check.status ?? 1);
