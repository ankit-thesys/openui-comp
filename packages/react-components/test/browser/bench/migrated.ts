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
  const body =
    // A margin-free body, so percentage sizes do not depend on whether a reset removed its margin.
    `<!doctype html><html><head><meta charset="utf-8"><style>body { margin: 0; }</style>${head}` +
    `</head><body><div id="root"></div><script type="module" src="/elements.js"></script></body></html>`;
  await page.route(`**${path}?*`, (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto(`${path}?component=${encodeURIComponent(component.folder)}`);
  // Any stable class will do: which parts and modifiers render depends on the elements.
  await page
    .locator(component.stableClasses.map((name) => `#root .${name}`).join(", "))
    .first()
    .waitFor();

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
  if (["Select", "Calendar", "DatePicker"].includes(component.folder))
    await page
      .locator("button")
      .evaluateAll((buttons) => buttons.forEach((button) => button.removeAttribute("type")));
  if (targetClass && ["Select", "Calendar", "DatePicker"].includes(component.folder))
    await expect(page.locator(`.${targetClass}`).first()).toBeAttached();
}
