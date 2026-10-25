import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { build } from "vite";

const packageRoot = fileURLToPath(new URL("../../../../", import.meta.url));
function command(file, args, cwd) {
  return execFileSync(file, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, npm_config_cache: path.join(tmpdir(), "openui-core-math-cache") },
  });
}

test(
  "installed TextContentWrapper preserves markdown and automatically loads math CSS/fonts",
  { timeout: 120000 },
  async () => {
    const scratch = await fs.realpath(
      await fs.mkdtemp(path.join(tmpdir(), "openui-math-consumer-")),
    );
    const consumer = process.env.CORE_CONSUMER ? path.resolve(process.env.CORE_CONSUMER) : scratch;
    let fixture, server, browser;
    try {
      if (!process.env.CORE_CONSUMER) {
        command("pnpm", ["pack", "--pack-destination", scratch], packageRoot);
        const tarball = (await fs.readdir(scratch)).find((name) => name.endsWith(".tgz"));
        assert(tarball);
        await fs.writeFile(
          path.join(scratch, "package.json"),
          JSON.stringify({
            private: true,
            type: "module",
            dependencies: {
              "@openuidev/react-ui-core": `file:./${tarball}`,
              react: "19.2.4",
              "react-dom": "19.2.4",
            },
          }),
        );
        command(
          "npm",
          ["install", "--ignore-scripts", "--prefer-offline", "--no-audit", "--no-fund"],
          scratch,
        );
      }
      assert(
        !(
          await fs.lstat(path.join(consumer, "node_modules/@openuidev/react-ui-core"))
        ).isSymbolicLink(),
        "exercise a normal installed package",
      );
      fixture = await fs.mkdtemp(path.join(consumer, ".math-fixture-"));
      await fs.writeFile(
        path.join(fixture, "index.html"),
        '<!doctype html><html><head></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>',
      );
      await fs.writeFile(
        path.join(fixture, "main.js"),
        `import React from 'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import{TextContentWrapper,ThemeProvider}from'@openuidev/react-ui-core';
const h=React.createElement;const root=createRoot(document.getElementById('app'));
window.renderWrapper=props=>flushSync(()=>root.render(h(ThemeProvider,null,h(TextContentWrapper,props))));
window.renderWrapper({textMarkdown:${JSON.stringify("**Rich** text around ~$886K and $literal$.\nnext line\n\n| Item | Value |\n| --- | --- |\n| A | 42 |\n\n$$\n\\frac{1}{2}+x^2\n$$")},header:{heading:'**Heading**',description:'Description'},variant:'card',className:'custom'});
window.unmountWrapper=()=>flushSync(()=>root.unmount());`,
      );
      const outDir = path.join(scratch, "built");
      await build({
        configFile: false,
        root: fixture,
        logLevel: "silent",
        build: { outDir, emptyOutDir: true },
      });
      server = http.createServer(async (request, response) => {
        try {
          const pathname = new URL(request.url, "http://localhost").pathname;
          const file = path.join(outDir, pathname === "/" ? "index.html" : pathname);
          const data = await fs.readFile(file);
          const extension = path.extname(file);
          response.setHeader(
            "content-type",
            {
              ".js": "text/javascript",
              ".css": "text/css",
              ".woff2": "font/woff2",
              ".woff": "font/woff",
              ".ttf": "font/ttf",
            }[extension] || "text/html",
          );
          response.end(data);
        } catch {
          response.writeHead(404);
          response.end();
        }
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      browser = await chromium.launch({ channel: "chrome", headless: true });
      const page = await browser.newPage();
      const errors = [],
        requests = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("requestfailed", (request) => errors.push(request.url()));
      page.on("response", (response) => {
        requests.push(response.url());
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.locator(".katex").waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert(await page.locator(".custom").count());
      assert.equal(
        await page.locator(".openui-inline-header-heading strong").textContent(),
        "Heading",
      );
      assert.equal(await page.locator("table tbody tr").textContent(), "A42");
      assert((await page.locator(".custom").textContent()).includes("~$886K and $literal$"));
      assert.equal(await page.locator("del").count(), 0);
      assert.equal(await page.locator(".openui-markdown-renderer-card").count(), 1);
      assert(
        (
          await page.locator(".katex").evaluate((node) => getComputedStyle(node).fontFamily)
        ).includes("KaTeX_Main"),
        "math styles load automatically from ordinary component imports",
      );
      assert(
        await page.evaluate(() =>
          [...document.fonts].some(
            (font) => font.family === "KaTeX_Main" && font.status === "loaded",
          ),
        ),
        "real KaTeX font is loaded",
      );
      assert(
        requests.some((url) => url.endsWith(".css")),
        "application bundler delivers vendor CSS",
      );
      assert(
        requests.some((url) => url.endsWith(".woff2")),
        "browser fetches vendor font assets",
      );
      assert.equal(
        await page.locator('link[rel="stylesheet"]').count(),
        1,
        "one vendor stylesheet",
      );
      await page.evaluate(() =>
        window.renderWrapper({ textMarkdown: "Updated", variant: "clear" }),
      );
      await page.waitForFunction(
        () => document.querySelector(".openui-text-content-markdown").textContent === "Updated",
      );
      assert.equal(await page.locator(".openui-inline-header").count(), 0);
      assert.equal(await page.locator(".katex").count(), 0);
      await page.evaluate(() => window.unmountWrapper());
      assert.equal(await page.locator("#app").textContent(), "");
      assert.deepEqual(errors, []);
    } finally {
      if (browser) await browser.close();
      if (server) await new Promise((resolve) => server.close(resolve));
      if (fixture) await fs.rm(fixture, { recursive: true, force: true });
      await fs.rm(scratch, { recursive: true, force: true });
    }
  },
);
