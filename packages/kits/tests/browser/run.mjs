import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const consumer = process.env.KIT_CONSUMER;
assert(consumer, "KIT_CONSUMER must be a normal installed packed consumer");
const tools = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS ?? "packages/react-ui-core", "package.json"),
);
const { build, preview } = await import(tools.resolve("vite"));
const { chromium } = tools("playwright");
const fixture = path.join(consumer, "browser");
await fs.mkdir(path.join(fixture, "public"), { recursive: true });
await fs.copyFile(
  fileURLToPath(new URL("app.tsx", import.meta.url)),
  path.join(fixture, "app.tsx"),
);
for (const name of ["plain", "tailwind3", "tailwind4"])
  await fs.copyFile(
    path.join(
      process.env.CORE_HOST_STYLES ?? "/private/tmp/core-forms-host",
      "frameworks",
      `${name}.css`,
    ),
    path.join(fixture, "public", `${name}.css`),
  );
await fs.writeFile(
  path.join(fixture, "index.html"),
  `<!doctype html><html><head><script>
const q=new URLSearchParams(location.search);const link=document.createElement('link');link.rel='stylesheet';link.href='/'+q.get('framework')+'.css';
if(q.get('order')==='before') document.head.append(link);else window.addEventListener('load',()=>document.head.append(link));
</script></head><body><div id="root"></div><script type="module" src="/app.tsx"></script></body></html>`,
);
let liveStreams = 0;
const config = {
  root: fixture,
  configFile: false,
  esbuild: { jsx: "automatic" },
  preview: { host: "127.0.0.1", port: 4191, strictPort: true },
  plugins: [
    {
      name: "test-stream-endpoint",
      configurePreviewServer(server) {
        server.middlewares.use("/stream", (req, res) => {
          let body = "";
          req.on("data", (data) => (body += data));
          req.on("end", () => {
            liveStreams++;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.flushHeaders();
            let offset = 0;
            const timer = setInterval(() => {
              res.write(body.slice(offset, offset + 48));
              offset += 48;
              if (offset >= body.length) res.end();
            }, 35);
            res.once("close", () => {
              clearInterval(timer);
              liveStreams--;
            });
          });
        });
      },
    },
  ],
};
await build({
  root: fixture,
  configFile: false,
  esbuild: { jsx: "automatic" },
  build: { outDir: "dist" },
  logLevel: "warn",
});
const server = await preview(config);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  for (const framework of ["plain", "tailwind3", "tailwind4"])
    for (const order of ["before", "after"]) {
      const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
      const errors = [];
      page.on("pageerror", (error) => {
        errors.push(error.message);
        console.error("PAGE", framework, order, error.message);
      });
      page.on("requestfailed", (r) => console.error("REQUEST", r.url(), r.failure()));
      page.on("console", (m) => {
        if (m.type() === "error") console.error("CONSOLE", m.text());
      });
      console.log("START", framework, order);
      await page.goto(`http://127.0.0.1:4191/?framework=${framework}&order=${order}`);
      const button = (name) => page.getByRole("button", { name, exact: true });
      await page.getByRole("combobox").waitFor();
      await page.waitForFunction(() => {
        const host = [...document.querySelectorAll('link[rel="stylesheet"]')].find((el) =>
          /\/(plain|tailwind3|tailwind4)\.css$/.test(el.getAttribute("href")),
        );
        return Boolean(host?.sheet?.cssRules.length && document.getElementById("_goober"));
      });
      const actualOrder = await page.evaluate(() => {
        const host = [...document.querySelectorAll('link[rel="stylesheet"]')].find((el) =>
          /\/(plain|tailwind3|tailwind4)\.css$/.test(el.getAttribute("href")),
        );
        return host.compareDocumentPosition(document.getElementById("_goober")) &
          Node.DOCUMENT_POSITION_FOLLOWING
          ? "before"
          : "after";
      });
      assert.equal(actualOrder, order, "actual host stylesheet order relative to Goober");
      assert.equal(
        await page.locator("#unthemed .openui-card").evaluate((el) => getComputedStyle(el).gap),
        "12px",
        "legacy default spacing works without provider",
      );
      await button("Start stream").click();
      await page.waitForFunction(
        () => document.querySelector("#status").textContent === "streaming",
      );
      await page.waitForFunction(() =>
        document.querySelector("main").textContent.includes("Sales overview"),
      );
      await page.waitForFunction(() => document.querySelector("#status").textContent === "idle");
      await page.locator('input[name="name"]').waitFor();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("main .openui-bar-chart-bar")].some(
          (el) => el.getBoundingClientRect().height > 0,
        ),
      );
      assert.equal(await page.locator("main .openui-bar-chart-bar").count(), 2);
      assert.equal(await page.locator("main table tbody tr").count(), 2);
      await button("Send details").click();
      assert.equal(await page.locator("#action").textContent(), "");
      await page.locator('input[name="name"]').fill("Ada");
      await button("Send details").click();
      assert.match(await page.locator("#action").textContent(), /Send details/);
      await button("Show the next quarter").click();
      assert.match(await page.locator("#action").textContent(), /Show the next quarter/);
      assert.match(await page.locator("main").textContent(), /Jan/);
      const normal = await button("Explicit override").evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      const hostNormal = await button("Host override").evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      assert.notEqual(hostNormal, "rgba(0, 0, 0, 0)");
      assert.equal(normal, hostNormal, `${framework}/${order}`);
      await button("Host override").hover();
      await button("Host override").evaluate(async (el) => {
        await Promise.all(el.getAnimations().map((animation) => animation.finished));
      });
      const hostHover = await button("Host override").evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      assert.notEqual(hostHover, hostNormal, "host hover must visibly change the background");
      await button("Explicit override").hover();
      await button("Explicit override").evaluate(async (el) => {
        await Promise.all(el.getAnimations().map((animation) => animation.finished));
      });
      await page.waitForFunction((expected) => {
        const el = [...document.querySelectorAll("button")].find(
          (el) => el.textContent === "Explicit override",
        );
        return el && getComputedStyle(el).backgroundColor === expected;
      }, hostHover);
      assert.equal(
        await button("Explicit override").evaluate((el) => getComputedStyle(el).backgroundColor),
        hostHover,
      );
      assert.equal(
        await button("Disabled override").evaluate((el) => getComputedStyle(el).cursor),
        "wait",
      );
      await button("Toggle theme").click();
      await page.waitForFunction(() =>
        document.querySelector('[role="combobox"]').textContent.includes("Moon"),
      );
      await page.getByRole("combobox").click();
      await page.getByRole("option", { name: /Deep/ }).click();
      assert.match(await page.getByRole("combobox").textContent(), /Deep/);
      await button("Load history").click();
      await page.waitForFunction(
        () => document.querySelector('input[name="name"]').value === "Grace",
      );
      await button("Start stream").click();
      await button("Cancel stream").click();
      await page.waitForFunction(() => document.querySelector("#status").textContent === "idle");
      await button("Start stream").click();
      await page.waitForFunction(() => document.querySelector("#status").textContent === "idle");
      assert.match(await page.locator("main").textContent(), /Sales overview/);
      await button("Clear response").click();
      assert.equal(await page.locator("main input").count(), 0);
      assert.deepEqual(errors, []);
      results.push({ framework, order, actualOrder, hostNormal, hostHover, pass: true });
      await page.close();
    }
  assert.equal(liveStreams, 0);
  console.log(
    JSON.stringify({ browser: browser.version(), consumer, results, liveStreams }, null, 2),
  );
} finally {
  await browser.close();
  server.httpServer?.closeAllConnections();
  await new Promise((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  );
}
