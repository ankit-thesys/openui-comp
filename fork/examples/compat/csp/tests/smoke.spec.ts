import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { smoke } from "../../shared/smoke";
import { assertSheets, headOrder, hydrated, watchErrors } from "./contract";
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
const layer = mode === "layered" ? "openui" : false;

// KNOWN LIMITATION (#169): React serializes `style` props into the server HTML as attributes, and
// a nonce never covers an attribute, so `style-src 'nonce-…'` blocks these while the HTML is
// parsed. After hydration React sets styles through the CSSOM, which the policy allows, but it
// leaves these server attributes as they are. Production react-ui renders the same attributes.
// The list is exact: any new attribute, or any blocked style tag, still fails.
const KNOWN_SERVER_STYLE_ATTRIBUTES = [
  // Radix SelectValue
  "pointer-events:none",
  // Radix Select's visually hidden native select, until hydration removes it
  "position:absolute;border:0;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;word-wrap:normal",
  // Radix RovingFocusGroup on TabsList
  "outline:none",
  // Radix Presence on the active TabsContent
  "animation-duration:0s",
  // MiniLineChart's size={120} frame: it stays at its container's size, even after hydration
  "width:120px;height:120px",
];
const knownHashes = KNOWN_SERVER_STYLE_ATTRIBUTES.map(
  (value) => `'sha256-${createHash("sha256").update(value).digest("base64")}'`,
);
// Chromium's console message for a blocked attribute names the attribute value's hash.
const knownAttributeError = (message: string) =>
  message.includes("Refused to apply inline style") &&
  knownHashes.some((hash) => message.includes(hash));
const serverStyleAttributes = (html: string) =>
  [...html.matchAll(/<[a-z][^>]*?\sstyle="([^"]*)"/g)].map((match) => match[1]);

test(`shared style and hydration contract (${mode})`, async ({ page }) => {
  // The shared console check has no allowlist, so the same capture runs here with only the known
  // attribute reports removed.
  const errors = watchErrors(page);
  await smoke(page, expect, {
    layer,
    serverSheets: 1,
    path: "/?theme=light",
    ready: `[data-compat-ready][data-compat-mode="${mode}"]`,
    assertions: { console: false },
  });
  await hydrated(page);
  await headOrder(page);
  expect(
    errors.filter((message) => !knownAttributeError(message)),
    "console, hydration and uncaught errors",
  ).toEqual([]);
});

test("hydration and a genuinely new browser rule", async ({ page }) => {
  const errors = watchErrors(page);
  const response = await page.goto("/");
  const html = await response!.text();
  expect(html).not.toContain("background-color:rgb(17, 34, 51)");
  expect(serverStyleAttributes(html), "server style attributes (known limitation)").toEqual(
    KNOWN_SERVER_STYLE_ATTRIBUTES,
  );
  await hydrated(page);
  const before = await assertSheets(page, layer);
  await page.getByRole("button", { name: "Load browser component" }).click();
  const lazy = page.locator("[data-browser-only]");
  await expect(lazy).toHaveCSS("background-color", "rgb(17, 34, 51)");
  await expect(lazy).toHaveCSS("padding-top", "19px");
  await expect(lazy).toHaveCSS("opacity", "1");
  expect(await assertSheets(page, layer)).toBeGreaterThan(before);
  await page.getByRole("button", { name: "Rerender" }).click();
  await expect(page.locator("[data-renders]")).toHaveAttribute("data-renders", "1");
  await assertSheets(page, layer);
  await headOrder(page);
  expect(await page.evaluate(() => window.__compat.recoverable)).toEqual([]);
  expect(response!.headers()["content-security-policy"]).toMatch(/style-src 'nonce-[^']+';/);
  expect
    .soft(
      await page.evaluate(() =>
        [...document.querySelectorAll("style")]
          .map((tag) => ({ id: tag.id, nonce: tag.nonce }))
          .filter((tag) => tag.nonce !== window.__nonce__),
      ),
      "every style tag must carry the request nonce",
    )
    .toEqual([]);
  // Include violations from parsing, hydration, theme insertion and the browser-only write.
  // Only the known attributes, each blocked once while the server HTML is parsed; nothing from
  // hydration, theme insertion or the browser-only write.
  expect
    .soft(await page.evaluate(() => window.__compat.violations), "securitypolicyviolation events")
    .toEqual(KNOWN_SERVER_STYLE_ATTRIBUTES.map(() => "style-src-attr: inline"));
  expect(
    errors.filter((message) => !knownAttributeError(message)),
    "console, hydration and uncaught errors through interaction",
  ).toEqual([]);
  expect(errors.filter(knownAttributeError)).toHaveLength(KNOWN_SERVER_STYLE_ATTRIBUTES.length);
  test.info().annotations.push({
    type: "known limitation",
    description: `style-src-attr blocks ${KNOWN_SERVER_STYLE_ATTRIBUTES.length} server-rendered style attributes; see KNOWN_SERVER_STYLE_ATTRIBUTES`,
  });
});

test("server sheet and nonce work with JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const response = await page.goto(test.info().project.use.baseURL as string);
    const html = await response!.text();
    const nonce = /style-src 'nonce-([^']+)'/.exec(
      response!.headers()["content-security-policy"]!,
    )![1];
    expect(html).toContain(`<style data-openui-styles nonce="${nonce}">`);
    await expect(page.locator(".openui-button")).toHaveCSS("border-radius", "8px");
    await expect(page.locator(".openui-button")).toHaveCSS("padding-left", "10px");
  } finally {
    await context.close();
  }
});
