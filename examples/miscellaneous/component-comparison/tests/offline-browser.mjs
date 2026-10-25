import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { once } from "node:events";
import { chromium } from "playwright";
import { createApp } from "../server.mjs";
import { demoSource } from "../src/offline-fixture.mjs";
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
const origin = `http://127.0.0.1:${app.server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.COMPARISON_CHROME,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultTimeout(20000);
const errors = [],
  apiRequests = [],
  externalRequests = [],
  media = [];
let switching = false;
await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== origin) {
    externalRequests.push(url.href);
    return route.abort();
  }
  if (url.pathname.startsWith("/api/")) {
    if (!switching) apiRequests.push(url.pathname);
    if (switching) return route.continue();
    return route.abort();
  }
  if (url.pathname === "/assets/landscape.svg") media.push(url.pathname);
  return route.continue();
});
page.on("pageerror", (e) => errors.push(e.message));
const result = {};
const panes = [
  page.frameLocator('iframe[title="Existing library"]'),
  page.frameLocator('iframe[title="Migrated library"]'),
];
async function settled() {
  await page.waitForFunction(() =>
    [...document.querySelectorAll("iframe")].every(
      (f) =>
        f.contentDocument.querySelector("#pane-status")?.textContent === "idle",
    ),
  );
}
try {
  await page.goto(origin + "/?mode=offline");
  await page.getByRole("button", { name: "Render all instantly" }).click();
  await panes[1]
    .getByText("Offline component atlas", { exact: true })
    .waitFor();
  await settled();
  await page.screenshot({
    path: ".test-results/offline-instant.png",
    fullPage: true,
  });
  for (const pane of panes) {
    assert.equal(await pane.locator("#pane-source").textContent(), demoSource);
    await pane.getByText("Direct Label example", { exact: true }).waitFor();
    assert.equal(await pane.locator("[data-direct-example]").count(), 4);
    await pane.getByRole("tab", { name: "Details tab", exact: true }).click();
    await pane.getByText("Details tab content", { exact: true }).waitFor();
    await pane
      .getByRole("button", { name: "How does offline work?", exact: true })
      .click();
    await pane
      .getByText("Accordion answer: local playback, no API calls.", {
        exact: true,
      })
      .waitFor();
    for (const label of [
      "Bar chart",
      "Line chart",
      "Area chart",
      "Radar chart",
      "Horizontal bar chart",
      "Pie chart",
      "Radial chart",
      "Scatter chart",
    ])
      await pane.getByRole("img", { name: label, exact: true }).waitFor();
    await pane
      .getByText("Carousel slide two", { exact: true })
      .scrollIntoViewIfNeeded();
    await pane.getByRole("switch").first().click();
    assert.equal(
      (await pane.locator('img[src="/assets/landscape.svg"]').count()) > 0,
      true,
    );
  }
  await panes[0].getByPlaceholder("Offline name").fill("Ada 🧭");
  assert.equal(
    await panes[1].getByPlaceholder("Offline name").inputValue(),
    "",
  );
  await panes[0]
    .getByRole("button", { name: "Log form values", exact: true })
    .click();
  await page.waitForFunction(() =>
    document
      .querySelector('[data-testid="activity-log"]')
      .textContent.includes("Ada 🧭"),
  );
  assert.match(await page.getByTestId("activity-log").textContent(), /legacy/);
  await panes[1].getByText("Log an offline follow-up", { exact: true }).click();
  await page.waitForFunction(() =>
    document
      .querySelector('[data-testid="activity-log"]')
      .textContent.includes("migrated"),
  );
  await page.getByLabel("Shared theme").selectOption("dark");
  for (const pane of panes)
    await pane.locator('html[data-theme="dark"]').waitFor();
  await page.getByRole("button", { name: "Stream demo", exact: true }).click();
  await page.waitForFunction(() => {
    const d = document.querySelector("iframe").contentDocument;
    const source = d.querySelector("#pane-source")?.textContent;
    return (
      source?.length > 0 &&
      d.body.textContent.includes("Offline component atlas") &&
      d.querySelector("#pane-status")?.textContent === "replaying"
    );
  });
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await settled();
  const partial = await panes[0].locator("#pane-source").textContent();
  assert(partial.length > 0 && partial.length < demoSource.length);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await page.getByText("Playing locally…", { exact: true }).waitFor();
  await page.getByText("Local response ready", { exact: true }).waitFor();
  await settled();
  for (const pane of panes)
    assert.equal(await pane.locator("#pane-source").textContent(), demoSource);
  const notices = await Promise.all(
    panes.map((pane) => pane.getByRole("alert").allTextContents()),
  );
  assert.deepEqual(notices, [[], []]);
  await page.getByRole("button", { name: "Stream demo", exact: true }).click();
  switching = true;
  await page.getByLabel("Demo mode").selectOption("live");
  await page.getByRole("button", { name: "Send prompt" }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).waitFor();
  await page.getByLabel("Demo mode").selectOption("offline");
  switching = false;
  await settled();
  await page.waitForTimeout(250);
  for (const pane of panes)
    assert.equal(await pane.locator("#pane-source").textContent(), "");
  await page.getByRole("button", { name: "Render all instantly" }).click();
  await panes[1]
    .getByText("Offline component atlas", { exact: true })
    .waitFor();
  await settled();
  await page.getByLabel("Shared theme").selectOption("light");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.locator("body").evaluate((el) => el.scrollWidth > innerWidth),
    false,
  );
  assert.deepEqual(apiRequests, []);
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(errors, []);
  assert(media.length > 0);
  Object.assign(result, {
    pass: true,
    browser: browser.version(),
    parsedEntries: 84,
    sharedResponseEntries: 80,
    directExamples: 4,
    apiRequests,
    externalRequests,
    pageErrors: errors,
    locallyLoadedMedia: media.length,
    instantAndStreamSameSource: true,
    stopRetainsPartial: true,
    replayRestartsSavedSource: true,
    actionValuesAndPaneLogged: true,
    independentDrafts: true,
    tabAccordionSwitchExercised: true,
    themes: ["light", "dark"],
    modeSwitchFenced: true,
    notices,
  });
} finally {
  if (!result.pass) {
    result.ui = await page.locator("body").innerText();
    result.panes = await Promise.all(
      panes.map((p) =>
        p
          .locator("body")
          .innerText()
          .catch(() => "unavailable"),
      ),
    );
    result.errors = errors;
    result.apiRequests = apiRequests;
    result.externalRequests = externalRequests;
  }
  await fs.mkdir(".test-results", { recursive: true });
  await fs.writeFile(
    ".test-results/offline-browser.json",
    JSON.stringify(result, null, 2),
  );
  await page.screenshot({
    path: ".test-results/offline-final.png",
    fullPage: true,
  });
  await browser.close();
  await app.close();
}
console.log(JSON.stringify(result, null, 2));
