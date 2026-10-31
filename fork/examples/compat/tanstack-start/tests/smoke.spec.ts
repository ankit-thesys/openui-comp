import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";
import { inspectStream } from "../scripts/check-stream.mjs";
import manifest from "../package.json" with { type: "json" };

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

test(`streamed SSR, hydration and style contract (${mode})`, async ({ page }) => {
  const html = await inspectStream(`http://127.0.0.1:${manifest.compat.port}`, mode);
  const serverCss = html.match(/<style data-openui-styles="[^"]*">([\s\S]*?)<\/style>/)?.[1];
  expect(serverCss, "full server sheet").toBeTruthy();

  // Record JS writes before navigation: parser-delivered server CSS is not a JS write.
  await page.addInitScript(() => {
    const writes: string[] = [];
    Object.assign(window, { __compatComponentWrites: writes });
    const isComponentSheet = (node: Node | null) =>
      node instanceof HTMLStyleElement &&
      (node.id === "openui-styles" || node.hasAttribute("data-openui-styles"));
    const appendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function <T extends Node>(node: T): T {
      if (isComponentSheet(this) && node.textContent?.trim()) writes.push(node.textContent);
      return appendChild.call(this, node) as T;
    };
    const append = Element.prototype.append;
    Element.prototype.append = function (...nodes: (Node | string)[]) {
      if (isComponentSheet(this)) {
        for (const node of nodes) {
          const text = typeof node === "string" ? node : node.textContent;
          if (text?.trim()) writes.push(text);
        }
      }
      return append.apply(this, nodes);
    };
    const insertRule = CSSStyleSheet.prototype.insertRule;
    CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
      if (isComponentSheet(this.ownerNode)) writes.push(rule);
      return insertRule.call(this, rule, index);
    };
  });

  await smoke(page, expect, {
    layer: mode === "layered" ? "openui" : false,
    serverSheets: 1,
    ready: `[data-compat-ready][data-compat-mode="${mode}"][data-compat-hydrated="true"]`,
  });

  const server = page.locator("head > style[data-openui-styles]");
  await expect(server).toHaveCount(1);
  expect(await server.textContent(), "hydration leaves the server CSS byte-for-byte intact").toBe(
    serverCss,
  );
  const sheetState = await page.evaluate(() => {
    const sheet = document.querySelector<HTMLStyleElement>("#openui-styles");
    const server = document.querySelector("style[data-openui-styles]")!;
    const appCss = document.querySelector("link[data-compat-app-css]")!;
    const overrides = document.querySelector("link[data-compat-overrides]")!;
    return {
      writes: (window as typeof window & { __compatComponentWrites: string[] })
        .__compatComponentWrites,
      browserRules: sheet?.sheet?.cssRules.length ?? 0,
      serverBeforeAppCss: !!(
        server.compareDocumentPosition(appCss) & Node.DOCUMENT_POSITION_FOLLOWING
      ),
      serverBeforeOverrides: !!(
        server.compareDocumentPosition(overrides) & Node.DOCUMENT_POSITION_FOLLOWING
      ),
    };
  });
  expect(sheetState.writes, "hydration must not write component rules already sent by SSR").toEqual(
    [],
  );
  expect(sheetState.browserRules, "full SSR sheet covers every fixture component").toBe(0);
  expect(sheetState.serverBeforeAppCss).toBe(true);
  expect(sheetState.serverBeforeOverrides).toBe(true);
  await page.getByRole("button", { name: "Continue: 0", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continue: 1", exact: true })).toBeVisible();
});
