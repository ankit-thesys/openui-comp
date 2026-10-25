import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { once } from "node:events";
import { chromium } from "playwright";
import { createApp } from "../server.mjs";
import { themePresetFixture, getThemePreset } from "../src/theme-presets.mjs";
import { defaultLightTheme, defaultDarkTheme } from "@openuidev/react-ui-core";
import { DEFAULT_CHROME, CHROME_VERSION } from "../bench/model.mjs";
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
const origin = `http://127.0.0.1:${app.server.address().port}`;
const browser = await chromium.launch({
  executablePath: DEFAULT_CHROME,
  headless: true,
});
assert.equal(browser.version(), CHROME_VERSION);
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const blocked = [],
  errors = [],
  results = [];
await page.route("**/*", (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== origin || url.pathname.startsWith("/api/")) {
    blocked.push(url.pathname);
    return route.abort();
  }
  return route.continue();
});
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(origin + "/?mode=offline");
  const left = page.frameLocator('iframe[title="Existing library"]'),
    right = page.frameLocator('iframe[title="Migrated library"]');
  await page.getByRole("button", { name: "Render all instantly" }).click();
  await left.getByPlaceholder("Offline name").fill("Ada");
  await right.getByPlaceholder("Offline name").fill("Bob");
  const sources = await Promise.all(
    [left, right].map((f) => f.locator("#pane-source").textContent()),
  );
  for (const preset of themePresetFixture.presets)
    for (const mode of ["light", "dark"]) {
      await page.getByLabel("Shared theme preset").selectOption(preset.id);
      await page.getByLabel("Shared theme", { exact: true }).selectOption(mode);
      await page.waitForTimeout(200);
      const arms = [];
      const expected = {
        ...(mode === "light" ? defaultLightTheme : defaultDarkTheme),
        ...(mode === "light" ? preset.lightTheme : preset.darkTheme),
      };
      for (const pane of [left, right]) {
        const combo = pane
          .getByRole("combobox")
          .filter({ hasText: "Choose project" });
        await combo.click();
        await pane.getByRole("listbox").waitFor();
        await pane
          .locator("#pane-preset")
          .filter({ hasText: preset.definitionHash })
          .waitFor({ state: "attached" });
        const measured = await pane.locator("body").evaluate((_, expected) => {
          function resolveColor(value) {
            const el = document.createElement("div");
            el.style.backgroundColor = value;
            document.body.append(el);
            const result = getComputedStyle(el).backgroundColor;
            el.remove();
            return result;
          }
          const button = document.querySelector(
            "button.openui-button-base-primary",
          );
          const portal = document.querySelector(".openui-select-content");
          const label = [...document.querySelectorAll("label")].find(
            (e) => e.textContent === "Direct Label example",
          );
          return {
            button: {
              background: getComputedStyle(button).backgroundColor,
              radius: getComputedStyle(button).borderRadius,
              fontSize: getComputedStyle(button).fontSize,
            },
            portal: {
              present: !!portal,
              background: portal
                ? getComputedStyle(portal).backgroundColor
                : null,
              foregroundToken: portal
                ? getComputedStyle(portal)
                    .getPropertyValue("--openui-foreground")
                    .trim()
                : null,
            },
            label: { color: label ? getComputedStyle(label).color : null },
            expected: {
              background: resolveColor(expected.interactiveAccentDefault),
              radius: expected.radiusM,
              fontSize: expected.textLabelDefault?.match(/(\d+)px/)?.[1] + "px",
              portalBackground: resolveColor(
                `color-mix(in oklch, ${expected.foreground}, ${expected.textWhite} 6%)`,
              ),
              labelColor: resolveColor(expected.textNeutralPrimary),
            },
            mode: document.documentElement.dataset.theme,
          };
        }, expected);
        assert.equal(measured.button.background, measured.expected.background);
        assert.equal(measured.button.radius, measured.expected.radius);
        assert.equal(measured.button.fontSize, measured.expected.fontSize);
        assert.equal(measured.portal.present, true);
        assert.equal(
          measured.portal.background,
          measured.expected.portalBackground,
        );
        assert.equal(measured.portal.foregroundToken, expected.foreground);
        assert.equal(measured.label.color, measured.expected.labelColor);
        assert.equal(measured.mode, mode);
        arms.push(measured);
        const next =
          themePresetFixture.presets[
            (themePresetFixture.presets.indexOf(preset) + 1) % 3
          ];
        await page.getByLabel("Shared theme preset").selectOption(next.id);
        await page.waitForTimeout(200);
        await pane.getByRole("listbox").waitFor();
        const nextTokens = {
          ...(mode === "light" ? defaultLightTheme : defaultDarkTheme),
          ...(mode === "light" ? next.lightTheme : next.darkTheme),
        };
        assert.equal(
          await pane
            .locator(".openui-select-content")
            .evaluate((e) =>
              getComputedStyle(e)
                .getPropertyValue("--openui-foreground")
                .trim(),
            ),
          nextTokens.foreground,
        );
        await page.getByLabel("Shared theme preset").selectOption(preset.id);
        await page.waitForTimeout(200);
        await pane.getByRole("listbox").press("Escape");
      }
      assert.deepEqual(arms[0], arms[1]);
      assert.equal(
        await left.getByPlaceholder("Offline name").inputValue(),
        "Ada",
      );
      assert.equal(
        await right.getByPlaceholder("Offline name").inputValue(),
        "Bob",
      );
      assert.deepEqual(
        await Promise.all(
          [left, right].map((f) => f.locator("#pane-source").textContent()),
        ),
        sources,
      );
      results.push({
        preset: preset.id,
        mode,
        definitionHash: preset.definitionHash,
        arms,
        independentDraftsPreserved: true,
        sourcePreserved: true,
        openPortalPreserved: true,
      });
    }

  await page.getByRole("button", { name: "Stream demo", exact: true }).click();
  await page.waitForFunction(() => {
    const d = document.querySelector("iframe").contentDocument;
    return (
      d.querySelector("#pane-source")?.textContent.length > 180 &&
      d.querySelector("#pane-status")?.textContent === "replaying"
    );
  });
  const before = await left.locator("#pane-source").textContent(),
    responseId = await left
      .locator(".assistant-message")
      .getAttribute("data-response-id");
  await page.getByLabel("Shared theme preset").selectOption("cyberpunk");
  await page.waitForTimeout(30);
  assert.equal(
    await left.locator(".assistant-message").getAttribute("data-response-id"),
    responseId,
  );
  assert((await left.locator("#pane-source").textContent()).startsWith(before));
  await page.getByText("Local response ready", { exact: true }).waitFor();
  assert.deepEqual(blocked, []);
  assert.deepEqual(errors, []);
  await fs.mkdir(".test-results", { recursive: true });
  await fs.writeFile(
    ".test-results/bench-themes.json",
    JSON.stringify(
      {
        pass: true,
        browser: browser.version(),
        fixture: themePresetFixture.version,
        combinations: results.length,
        results,
        switchDuringStreamPreserved: true,
        blocked,
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      pass: true,
      combinations: results.length,
      presets: themePresetFixture.presets.map((p) => ({
        id: p.id,
        hash: p.definitionHash,
      })),
      switchDuringStreamPreserved: true,
      blocked,
      pageErrors: errors,
    }),
  );
} catch (error) {
  await fs.mkdir(".test-results", { recursive: true });
  await page.screenshot({
    path: ".test-results/bench-theme-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
  await app.close();
}
