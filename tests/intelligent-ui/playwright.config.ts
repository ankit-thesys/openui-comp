import { defineConfig } from "@playwright/test";
import { hostName, hosts, ports } from "./harness/matrix";

/**
 * One project per host in harness/matrix.ts. The library must already be built (`pnpm build:library`);
 * the host is built here and served the way it ships, from `vite preview`.
 */
const reacts = [...new Set(hosts.map((host) => host.react))];

export default defineConfig({
  testDir: "specs",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: 0,
  reporter: process.env["CI"] ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      // WebGL for maps, without a GPU.
      args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
    },
  },
  projects: hosts.map((host, index) => ({
    name: hostName(host),
    use: { browserName: "chromium", viewport: { width: host.width, height: 900 } },
    metadata: { host },
    // The self-test checks the checks, so it runs once, on the first host.
    testIgnore: index === 0 ? undefined : /self-test\.spec\.ts/,
  })),
  webServer: reacts.map((react) => ({
    command: `pnpm build:host && pnpm exec vite preview --config host/vite.config.ts --port ${ports[react]} --strictPort`,
    // host/vite.config.ts builds and serves the React version IU_REACT names.
    env: { IU_REACT: react },
    port: ports[react],
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
  })),
});
