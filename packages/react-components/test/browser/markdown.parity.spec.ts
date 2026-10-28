import { expect, test, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { checkParity } from "./parity/parity";

// The shared snapshot covers typography, borders, layout and dimensions. Prose also has
// structural spacing, list markers and quote pseudo-elements that need computed-style parity.
async function proseSnapshot(page: Page, fixture: string, mode: "light" | "dark") {
  await page.goto(`/${fixture}.html?mode=${mode}`);
  await expect(page.locator("[data-parity-part]").first()).toBeVisible();
  return page.locator("[data-parity-part]").evaluateAll((parts, mode) => {
    const properties = [
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "font-style",
      "list-style-type",
      "quotes",
      "text-decoration-line",
      "white-space",
      "border-left-width",
      "border-left-style",
    ];
    const pseudoProperties = [
      "content",
      "color",
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "vertical-align",
      "margin-left",
      "margin-right",
    ];
    return Object.fromEntries(
      parts.map((part) => {
        const key = `${mode} ${part.closest("[data-parity-case]")!.getAttribute("data-parity-case")} ${part.getAttribute("data-parity-part")}`;
        const style = getComputedStyle(part);
        const values: Record<string, string> = Object.fromEntries(
          properties.map((property) => [property, style.getPropertyValue(property)]),
        );
        for (const pseudo of ["::before", "::after", "::marker"]) {
          const computed = getComputedStyle(part, pseudo);
          for (const property of pseudoProperties)
            values[`${pseudo} ${property}`] = computed.getPropertyValue(property);
        }
        return [key, values];
      }),
    );
  }, mode);
}

test("MarkDownRenderer matches the #72 computed styles for every element and variant", async ({
  page,
}) => {
  test.setTimeout(180_000);
  // The removed :first-child highlighter margin rule never matched, so no computed exceptions.
  await checkParity(page, "markdown");
  const capture = !!process.env["OPENUI_PARITY_CAPTURE"];
  const fixture = `parity-markdown${capture ? "-baseline" : ""}`;
  const current = {
    ...(await proseSnapshot(page, fixture, "light")),
    ...(await proseSnapshot(page, fixture, "dark")),
  };
  const baseline = new URL("./parity/baselines/markdown-prose.json", import.meta.url);
  if (capture) writeFileSync(baseline, JSON.stringify(current, null, 2) + "\n");
  else
    expect(current, "prose spacing, markers and quotes differ from #72").toEqual(
      JSON.parse(readFileSync(baseline, "utf8")),
    );
});
