import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs/promises";
import { once } from "node:events";
import { chromium } from "playwright";
import { createApp } from "../server.mjs";
import { mockResponse } from "../mock.mjs";
let calls = 0,
  cancelled = 0,
  active = 0;
const requests = [];
const upstream = http.createServer(async (req, res) => {
  if (req.url !== "/v1/chat/completions") {
    res.writeHead(404);
    res.end();
    return;
  }
  let body = "";
  for await (const c of req) body += c;
  const input = JSON.parse(body);
  requests.push(input);
  calls++;
  active++;
  const abort = new AbortController();
  let complete = false;
  res.once("close", () => {
    active--;
    if (!complete) {
      cancelled++;
      abort.abort();
    }
  });
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  res.flushHeaders();
  try {
    for await (const text of mockResponse({
      messages: input.messages.filter((m) => m.role !== "system"),
      signal: abort.signal,
    })) {
      res.write(
        "data: " +
          JSON.stringify({
            id: "local-test",
            object: "chat.completion.chunk",
            created: 1,
            model: "mock-ui",
            choices: [
              { index: 0, delta: { content: text }, finish_reason: null },
            ],
          }) +
          "\n\n",
      );
    }
    complete = true;
    res.end(
      "data: " +
        JSON.stringify({
          id: "local-test",
          object: "chat.completion.chunk",
          created: 1,
          model: "mock-ui",
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        }) +
        "\n\ndata: [DONE]\n\n",
    );
  } catch {
    if (!res.destroyed) res.end();
  }
});
upstream.listen(0, "127.0.0.1");
await once(upstream, "listening");
const app = await createApp({
  env: {
    NODE_ENV: "production",
    COMPARISON_MODE: "live",
    THESYS_API_KEY: "test-only-never-a-real-key",
    THESYS_BASE_URL: `http://127.0.0.1:${upstream.address().port}/v1`,
    THESYS_MODEL: "mock-ui",
  },
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
const executablePath = process.env.COMPARISON_CHROME;
const browser = await chromium.launch(
  executablePath
    ? { executablePath, headless: true }
    : { channel: "chrome", headless: true },
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultTimeout(20000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await fs.mkdir(".test-results", { recursive: true });
const result = {};
try {
  await page.goto(`http://127.0.0.1:${app.server.address().port}`);
  const left = page.frameLocator('iframe[title="Existing library"]'),
    right = page.frameLocator('iframe[title="Migrated library"]');
  const send = page.getByRole("button", { name: "Send prompt" });
  await send.waitFor();
  await page.waitForFunction(
    () => !document.querySelector('button[type="submit"]').disabled,
  );
  await send.click();
  await page.getByRole("button", { name: "Stop", exact: true }).waitFor();
  await page
    .locator("#prompt")
    .fill("This next draft must survive completion.");
  await send.waitFor();
  assert.equal(
    await page.locator("#prompt").inputValue(),
    "This next draft must survive completion.",
  );
  await page.screenshot({
    path: ".test-results/comparison-populated.png",
    fullPage: true,
  });
  assert.equal(calls, 1);
  assert.equal(
    await left.locator("#pane-source").textContent(),
    await right.locator("#pane-source").textContent(),
  );
  await left.getByPlaceholder("Your name").fill("Ada");
  assert.equal(await right.getByPlaceholder("Your name").inputValue(), "");
  await left.getByRole("button", { name: "Send details", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).waitFor();
  await send.waitFor();
  assert.equal(calls, 2);
  assert(requests[1].messages.at(-1).content.includes("Ada"));
  assert(requests[1].messages.at(-1).content.includes("submittedAction"));
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await send.waitFor();
  assert.equal(calls, 2);
  assert.equal(
    await left.locator("#pane-source").textContent(),
    await right.locator("#pane-source").textContent(),
  );
  await page.getByLabel("Shared theme", { exact: true }).selectOption("dark");
  await right.locator('html[data-theme="dark"]').waitFor();
  await left.locator('html[data-theme="dark"]').waitFor();
  const sheets = await right
    .locator("body")
    .evaluate(() => [...document.styleSheets].map((s) => s.href));
  assert(
    !sheets.some((s) => s?.includes("legacy")),
    "Migrated pane must not load the legacy entry stylesheet",
  );
  await page.locator("#prompt").fill("Stop this stream");
  await send.click();
  await left
    .locator(".assistant-message")
    .last()
    .getByText(/Same response/)
    .first()
    .waitFor();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await send.waitFor();
  for (let i = 0; i < 40 && active; i++)
    await new Promise((r) => setTimeout(r, 25));
  assert.equal(active, 0);
  assert(cancelled >= 1);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("iframe")].every(
      (f) =>
        f.contentDocument.querySelector("#pane-source")?.textContent === "",
    ),
  );
  assert.equal(await left.locator("#pane-source").textContent(), "");
  assert.equal(await right.locator("#pane-source").textContent(), "");
  const before = calls;
  await page.evaluate(() =>
    window.postMessage(
      {
        channel: "openui-component-comparison/v1",
        type: "action",
        viewId: "forged",
        responseId: "forged",
        action: { type: "continue_conversation", humanFriendlyMessage: "bad" },
      },
      location.origin,
    ),
  );
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(calls, before);
  await page.locator("#prompt").fill("A fresh comparison");
  await send.click();
  await send.waitFor();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("iframe")].every(
      (f) =>
        f.contentDocument.querySelector("#pane-status")?.textContent === "idle",
    ),
  );
  const rightSource = await right.locator("#pane-source").textContent();
  const revision = Number(await left.locator("#pane-revision").textContent());
  await page.evaluate(
    ({ revision }) => {
      document.querySelector("iframe").contentWindow.postMessage(
        {
          channel: "openui-component-comparison/v1",
          type: "snapshot",
          snapshot: {
            messages: [
              {
                id: "error-only",
                role: "assistant",
                content: "root = MissingComponent()",
              },
            ],
            status: "idle",
            error: "",
            theme: "dark",
            viewId: "error-test",
            revision: revision + 1,
            allowActions: false,
          },
        },
        location.origin,
      );
    },
    { revision },
  );
  await left.getByRole("alert").waitFor();
  assert.equal(await right.locator("#pane-source").textContent(), rightSource);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await left.getByRole("alert").waitFor({ state: "hidden" });
  assert.deepEqual(errors, []);
  await page.getByLabel("Shared theme", { exact: true }).selectOption("light");
  await page.screenshot({
    path: ".test-results/comparison-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.locator("body").evaluate((el) => el.scrollWidth > innerWidth),
    false,
  );
  Object.assign(result, {
    pass: true,
    calls,
    cancelled,
    active,
    oneCallFanout: true,
    independentDrafts: true,
    actionValuesPreserved: true,
    replayNoCall: true,
    stopAbortsUpstream: true,
    promptDraftPreserved: true,
    paneErrorIsolated: true,
    forgedSourceRejected: true,
    browser: browser.version(),
    pageErrors: errors,
  });
} finally {
  if (!result.pass) {
    result.ui = await page.locator("body").innerText();
    result.calls = calls;
    result.errors = errors;
    await page.screenshot({
      path: ".test-results/failure.png",
      fullPage: true,
    });
  }
  await fs.mkdir(".test-results", { recursive: true });
  await fs.writeFile(
    ".test-results/browser.json",
    JSON.stringify(result, null, 2),
  );
  await browser.close();
  await app.close();
  upstream.closeAllConnections();
  await new Promise((r) => upstream.close(r));
}
console.log(JSON.stringify(result, null, 2));
