// Pages that client-render each migrated component (fixtures/migrated-server.tsx) through the
// `elements` fixture, the way a client-only app renders them.
import { expect, type Page } from "@playwright/test";

// Built by build-fixtures.ts (Playwright's global setup) before any spec runs.
const { migrated } = (await import(
  new URL("../.fixtures/server/migrated-server.mjs", import.meta.url).href
)) as typeof import("../fixtures/migrated-server");

export type MigratedComponent = (typeof migrated)[number];
export { migrated };

/** Opens a page rendering `component`, with `head` (consumer CSS, say) before the bundle. */
export async function openMigrated(
  page: Page,
  component: MigratedComponent,
  head = "",
  targetClass = "",
  openPortals = true,
) {
  const path = `/migrated-${component.folder}.html`;
  // SegmentedBar deliberately inherits the page's font. Give the chart bench explicit page
  // typography so Preflight's html font/line-height reset does not change that input. Use body
  // so portalled chart parts inherit the same typography as the elements inside #root. Load
  // the page rule after head CSS: Tailwind 3 also declares body { line-height: inherit }.
  const typography = component.folder === "Charts" ? "font: 16px/normal serif;" : "";
  const body =
    // Normalize page-owned typography, margins and native button currentColor.
    // Body typography follows Tailwind so its inherited line-height cannot reset this input;
    // zero-specificity button color still lets library and consumer rules win.
    `<!doctype html><html><head><meta charset="utf-8"><style>:where(button) { color: inherit; }</style>${head}<style>body { margin: 0; ${typography} }</style>` +
    `</head><body><div id="root"></div><script type="module" src="/elements.js"></script></body></html>`;
  await page.route(`**${path}?*`, (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto(`${path}?component=${encodeURIComponent(component.folder)}`);
  // Wait for a visible stable part: a Modal portal root has no box because its children
  // are fixed-positioned. Selecting that root first would time out despite an open dialog.
  await page
    .locator(component.stableClasses.map((name) => `.${name}:visible`).join(", "))
    .first()
    .waitFor();
  if (component.folder === "Citation") {
    // The contract includes portalled parts. Pin a real tooltip and wait for its lazy icon;
    // the benches query the whole document so the portal participates alongside the trigger.
    await page.getByRole("button", { name: "Citations", exact: true }).click();
    await page.locator(".openui-citation-tooltip").waitFor();
    await page.locator("svg.openui-citation-icon").waitFor();
    await page.mouse.move(0, 700);
  }
  // #96: owned lazy SVG parts must participate in overrides and preflight comparisons.
  if (component.folder === "IconTag" || component.folder === "IconText")
    await page.locator("svg.openui-icon-tag-icon").first().waitFor();
  if (component.folder === "SourceFaviconImage")
    await page.locator("svg.openui-source-favicon-image").waitFor();
  if (component.folder === "EditableTable") {
    // Wait for measured overflow, then exercise a real editing state. The select's content
    // lives outside #root; all bench snapshots and override queries include the document.
    await page.locator('.openui-editable-table-scroll-control[data-side="right"]').waitFor();
    const input = targetClass === "openui-editable-table-cell-input";
    const cell = page.locator(".openui-editable-table-cell-base").nth(input ? 0 : 3);
    await cell.click();
    await cell.press("Enter");
    await page
      .locator(
        input ? "input.openui-editable-table-cell-input" : ".openui-editable-table-select-item",
      )
      .first()
      .waitFor();
  }

  // #93: mount the requested portal through the public trigger. Its wrapper can have zero
  // height, so readiness means a visible item/day. Only one modal Select opens per page.
  if (openPortals && component.folder === "Select") {
    const size = targetClass.match(/--size-(sm|md|lg)$/)?.[1] ?? "md";
    const position = targetClass.endsWith("--position-item-aligned") ? "item-aligned" : "popper";
    await page
      .locator(`.openui-select-trigger--size-${size}[data-bench-position="${position}"]`)
      .first()
      .click();
    await expect(page.locator('.openui-select-item[data-state="checked"]')).toBeFocused();
  } else if (openPortals && component.folder === "Calendar") {
    const years = /select-(viewport|item)|content-years/.test(targetClass);
    await page
      .locator(".openui-calendar-select-trigger")
      .nth(years ? 1 : 0)
      .click();
    await expect(page.locator('.openui-select-item[data-state="checked"]')).toBeFocused();
    const content = page.locator(`.openui-calendar-select-content-${years ? "years" : "months"}`);
    await expect
      .poll(() => content.evaluate((el) => parseFloat((el as HTMLElement).style.maxHeight)))
      .toBeGreaterThan(0);
  } else if (openPortals && component.folder === "DatePicker") {
    await page.locator(".openui-date-picker-trigger").first().click();
    await expect(
      page.locator(".openui-date-picker-menu .openui-calendar-day-button").first(),
    ).toBeVisible();
  }
  // The ordinary matrix uses untyped buttons. The typed-background tests explicitly restore
  // type=button, including Radix's automatically typed triggers and any portal buttons.
  if (["Select", "Calendar", "DatePicker", "Slider"].includes(component.folder))
    await page
      .locator("button")
      .evaluateAll((buttons) => buttons.forEach((button) => button.removeAttribute("type")));
  if (targetClass && ["Select", "Calendar", "DatePicker", "Slider"].includes(component.folder))
    await expect(page.locator(`.${targetClass}`).first()).toBeAttached();
  if (component.folder === "Charts") {
    await page
      .getByTestId("bench-chart-tooltip")
      .getByRole("img", { name: "Line chart", exact: true })
      .hover({ position: { x: 120, y: 80 } });
    // The portal wrapper is a positioning element. Its visible panel is readiness, and lives
    // outside #root; the override and Tailwind snapshots must include it.
    await page.locator(".openui-chart-tooltip").waitFor({ state: "visible" });
    await page
      .locator(".openui-chart-tooltip-portal[data-positioned]")
      .waitFor({ state: "attached" });
  }
}
