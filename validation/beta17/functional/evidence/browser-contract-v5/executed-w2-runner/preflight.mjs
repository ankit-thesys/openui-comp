import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { cancellationErrors } from "./analysis.mjs";
import {
  cancelStream,
  closeArm,
  measureStream,
  mount,
  openArm,
  snapshot,
  unmount,
} from "./browser.mjs";
if (process.env.BETA17_QUIET_WINDOW_RELEASED !== "yes")
  throw new Error("Quiet-window release required");
const manifest = JSON.parse(await fs.readFile(process.argv[2], "utf8"));
const require = createRequire(`${manifest.consumer}/package.json`);
const { chromium } = require(process.env.BETA17_PLAYWRIGHT_MODULE);
const report = { kind: "preflight-only", runs: [], errors: [] };
try {
  for (const workload of ["chat", "dashboard"])
    for (const load of ["paced", "stress"])
      for (const arm of ["baseline", "runtime"]) {
        let host;
        try {
          host = await openArm(chromium, manifest, workload, load, arm);
          await mount(host, manifest, 220);
          report.runs.push(await measureStream(host, manifest, { input: load === "paced" }));
          if (load === "paced") {
            await unmount(host, manifest);
            await mount(host, manifest, 17);
            const observation = await cancelStream(host, manifest);
            const errors = cancellationErrors(
              observation,
              manifest.cells[`${workload}/${load}`].expectedText,
            );
            report.runs.at(-1).cancellation = observation;
            if (errors.length) throw new Error(errors.join("; "));
          }
          await unmount(host, manifest);
          report.runs.at(-1).memory = await snapshot(host, { collect: true });
        } finally {
          if (host) await closeArm(host);
        }
      }
} catch (error) {
  report.errors.push(error.stack);
}
await fs.writeFile(process.argv[3], JSON.stringify(report, null, 2));
console.log(JSON.stringify({ completed: report.runs.length, errors: report.errors }));
if (report.errors.length) process.exitCode = 1;
