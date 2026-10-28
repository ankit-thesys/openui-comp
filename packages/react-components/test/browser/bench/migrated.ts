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
export async function openMigrated(page: Page, component: MigratedComponent, head = "") {
  const path = `/migrated-${component.folder}.html`;
  // These properties are page-owned in #72 and in the flat build. Hold their layout inputs
  // constant so percentage loader offsets and auto grid tracks compare library styling,
  // rather than Tailwind's box-sizing reset or its removal of the inline-image baseline gap.
  const mediaPageDefaults =
    component.folder === "ImageBlock"
      ? "*, ::before, ::after { box-sizing: border-box; }"
      : component.folder === "ImageGallery"
        ? "img { display: block; vertical-align: middle; }"
        : "";
  const body =
    // Normalize page-owned defaults in both runs: margins affect percentage sizes, and native
    // button text color affects currentColor from `border: none` inside Citation's tooltip.
    // Tailwind inherits that color; use the same baseline without changing library declarations.
    `<!doctype html><html><head><meta charset="utf-8"><style>body { margin: 0; } button { color: inherit; } ${mediaPageDefaults}</style>${head}` +
    `</head><body><div id="root"></div><script type="module" src="/elements.js"></script></body></html>`;
  await page.route(`**${path}?*`, (route) => route.fulfill({ contentType: "text/html", body }));
  if (component.folder === "ImageBlock") await page.route("**/media-pending.svg", () => {});
  await page.goto(`${path}?component=${encodeURIComponent(component.folder)}`, {
    waitUntil: component.folder === "ImageBlock" ? "domcontentloaded" : "load",
  });
  // Any stable class will do: which parts and modifiers render depends on the elements.
  await page
    .locator(component.stableClasses.map((name) => `#root .${name}`).join(", "))
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
  if (component.folder === "ImageGallery") {
    // Include the portalled classes in both common benches, outside #root. The six-image
    // case overflows the thumbnail track, exposing both measurement-only scroll controls.
    await page
      .locator(".openui-image-gallery")
      .last()
      .locator(".openui-image-gallery-image")
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator(".openui-image-gallery-modal-carousel").evaluate((el) => {
      el.scrollLeft = 100;
    });
    await expect(page.getByRole("button", { name: "Scroll images left" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Scroll images right" })).toBeVisible();
    for (const name of component.clientOnly)
      await expect(page.locator(`.${name}`).first()).toBeAttached();
  }
  if (component.folder === "Carousel") {
    await page
      .locator(".openui-carousel--show-buttons .openui-carousel-content")
      .evaluateAll((els) =>
        els.forEach((el) => {
          el.scrollLeft = 300;
        }),
      );
    await expect(page.locator(".openui-carousel-previous")).toHaveCount(4);
    await expect(page.locator(".openui-carousel-next")).toHaveCount(4);
  }
}
