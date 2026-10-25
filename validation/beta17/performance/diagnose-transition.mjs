// Diagnostic only: logs public Playwright lifecycle boundaries, not acceptance timings.
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { closeArm, measureStream, mount, openArm, unmount } from "./browser.mjs";
const manifest = JSON.parse(await fs.readFile(process.argv[2], "utf8"));
const require = createRequire(`${manifest.consumer}/package.json`);
const { chromium } = require(process.env.BETA17_PLAYWRIGHT_MODULE);
const hosts = {};
const log = (stage, details = {}) => console.log(JSON.stringify({ stage, ...details }));
for (const arm of ["baseline", "runtime"]) {
  hosts[arm] = await openArm(chromium, manifest, "chat", "paced", arm);
  await mount(hosts[arm], manifest, 220);
  await measureStream(hosts[arm], manifest);
  await unmount(hosts[arm], manifest);
  log("warmup-complete", { arm });
}
for (let pair = 0; pair < 10; pair++)
  for (const arm of pair % 2 ? ["runtime", "baseline"] : ["baseline", "runtime"]) {
    await mount(hosts[arm], manifest, 220);
    await measureStream(hosts[arm], manifest, { input: true });
    await unmount(hosts[arm], manifest);
    log("diagnostic-stream-complete", { arm, pair });
  }
await Promise.all(
  Object.entries(hosts).map(async ([arm, host]) => {
    log("browser-close-start", { arm });
    await closeArm(host);
    log("browser-close-end", { arm });
  }),
);
log("all-closed");
