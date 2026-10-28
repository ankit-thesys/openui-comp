// Computed-style parity: snapshots every `[data-parity-case]` block of a fixture in each state and
// compares it with a baseline captured from the #72 source (see test/README.md, "Parity").
import { expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type Mode = "light" | "dark";
export type State = "rest" | "hover" | "active";
type Snapshot = Record<string, Record<string, string>>;

// Properties a consumer would notice. Parts are marked `data-parity-part` inside each case.
const PROPERTIES = [
  "background-color",
  "color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-width",
  "border-top-style",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "box-shadow",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "font-variation-settings",
  "cursor",
  "opacity",
  "display",
  "gap",
  "align-items",
  "box-sizing",
  "transition-property",
  "transition-duration",
];

/** Captures blocks and parts of one case element, after any running transition has finished. */
const measure = (root: Element, properties: string[]) => {
  const out: Record<string, string> = {};
  const record = (el: Element, prefix: string) => {
    el.getAnimations().forEach((animation) => animation.finish());
    const style = getComputedStyle(el);
    for (const property of properties)
      out[`${prefix}${property}`] = style.getPropertyValue(property);
    const box = el.getBoundingClientRect();
    out[`${prefix}width`] = box.width.toFixed(2);
    out[`${prefix}height`] = box.height.toFixed(2);
  };
  record(root, "");
  root.querySelectorAll("[data-parity-part]").forEach((part) => {
    record(part, `${part.getAttribute("data-parity-part")}.`);
  });
  // Parts the component renders itself, named by selector in the case's `data-parity-parts`
  // JSON ({ "<part name>": "<selector within the case>" }); a part that is absent is skipped.
  const named = JSON.parse(root.getAttribute("data-parity-parts") ?? "{}") as Record<
    string,
    string
  >;
  for (const [name, selector] of Object.entries(named)) {
    // Portal siblings (Modal's overlay, for example) live outside the case's content root.
    const part = selector.startsWith("document:")
      ? document.querySelector(selector.slice("document:".length))
      : root.querySelector(selector);
    if (part) record(part, `${name}.`);
  }
  return out;
};

/** Snapshots every case of `fixture` in `mode`, at rest and under hover and press. */
export async function snapshot(page: Page, fixture: string, mode: Mode): Promise<Snapshot> {
  await page.goto(`/${fixture}.html?mode=${mode}`);
  const cases = page.locator("[data-parity-case]");
  await expect(cases.first()).toBeVisible();
  const ids = await cases.evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-parity-case")!),
  );
  const result: Snapshot = {};
  for (const id of ids) {
    const el = page.locator(`[data-parity-case="${id}"]`);
    const take = (state: State) =>
      el.evaluate(measure, PROPERTIES).then((values) => {
        result[`${mode} ${id} ${state}`] = values;
      });
    await page.mouse.move(0, 0);
    await take("rest");
    await el.hover();
    await take("hover");
    await page.mouse.down();
    await take("active");
    await page.mouse.up();
  }
  return result;
}

const baselinePath = (name: string) =>
  fileURLToPath(new URL(`./baselines/${name}.json`, import.meta.url));

/**
 * In capture mode (`OPENUI_PARITY_CAPTURE=1`) snapshots the `-baseline` bundle and writes the
 * baseline file; otherwise compares the current bundle with it. `intentional` lists
 * `"<snapshot key> <property>"` entries allowed to differ, each a documented design change.
 */
export async function checkParity(
  page: Page,
  name: string,
  intentional: readonly string[] = [],
): Promise<void> {
  const capture = !!process.env["OPENUI_PARITY_CAPTURE"];
  const fixture = `parity-${name}${capture ? "-baseline" : ""}`;
  const current: Snapshot = {
    ...(await snapshot(page, fixture, "light")),
    ...(await snapshot(page, fixture, "dark")),
  };
  if (capture) {
    mkdirSync(fileURLToPath(new URL("./baselines/", import.meta.url)), { recursive: true });
    // One snapshot per line keeps recapture diffs readable per case.
    const lines = Object.entries(current).map(
      ([key, values]) => `  ${JSON.stringify(key)}: ${JSON.stringify(values)}`,
    );
    writeFileSync(baselinePath(name), `{\n${lines.join(",\n")}\n}\n`);
    return;
  }
  const baseline = JSON.parse(readFileSync(baselinePath(name), "utf8")) as Snapshot;
  const differences: string[] = [];
  for (const key of new Set([...Object.keys(baseline), ...Object.keys(current)])) {
    for (const property of new Set([
      ...Object.keys(baseline[key] ?? {}),
      ...Object.keys(current[key] ?? {}),
    ])) {
      const before = baseline[key]?.[property];
      const after = current[key]?.[property];
      if (before !== after && !intentional.includes(`${key} ${property}`)) {
        differences.push(`${key} ${property}: ${before} → ${after}`);
      }
    }
  }
  expect(differences, "computed styles differ from the #72 baseline").toEqual([]);
}
