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
  // A fixture may add domain-specific properties (for example SVG strokes and animation timing).
  properties = [
    ...properties,
    ...(JSON.parse(root.getAttribute("data-parity-properties") ?? "[]") as string[]),
  ];
  const out: Record<string, string> = {};
  const record = (el: Element, prefix: string) => {
    const style = getComputedStyle(el);
    for (const property of properties) {
      // Local SVG paint URLs identify the same gradient in current/baseline pages despite their
      // different fixture filenames. Compare the fragment, retaining external paint-server URLs.
      const value = style.getPropertyValue(property);
      out[`${prefix}${property}`] = value.replace(
        /url\(["']?([^"'()]*)["']?\)/g,
        (match, url: string) => {
          const resolved = new URL(url, location.href);
          return resolved.origin === location.origin &&
            resolved.pathname === location.pathname &&
            resolved.hash
            ? `url("${resolved.hash}")`
            : match;
        },
      );
    }
    const box = el.getBoundingClientRect();
    out[`${prefix}width`] = box.width.toFixed(2);
    out[`${prefix}height`] = box.height.toFixed(2);
  };
  const parts: Array<[Element, string]> = [[root, ""]];
  root.querySelectorAll("[data-parity-part]").forEach((part) => {
    parts.push([part, `${part.getAttribute("data-parity-part")}.`]);
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
    if (part) parts.push([part, `${name}.`]);
  }
  // Portals live outside the case root. A fixture may explicitly name their public DOM parts.
  const globalParts = JSON.parse(root.getAttribute("data-parity-global-parts") ?? "{}") as Record<
    string,
    string
  >;
  for (const [name, selector] of Object.entries(globalParts)) {
    const part = document.querySelector(selector);
    if (part) parts.push([part, `${name}.`]);
  }
  // SVG group bounds include transformed descendants. Settle every observed subtree before
  // reading any geometry, including animated children that are not themselves named parts.
  // Global parts (portals) need the same treatment even though they live outside the case.
  const animations = new Set(parts.flatMap(([part]) => part.getAnimations({ subtree: true })));
  animations.forEach((animation) => {
    // Infinite skeleton pulses cannot finish (the Web Animations API throws). Compare the
    // same first frame in #72 and the current build; the pulse spec checks progression.
    if (animation.effect?.getTiming().iterations === Infinity) {
      animation.pause();
      animation.currentTime = 0;
    } else animation.finish();
  });
  for (const [part, prefix] of parts) record(part, prefix);
  return out;
};

/** Snapshots every case of `fixture` in `mode`, at rest and under hover and press. */
export interface ParityOptions {
  /** Each scenario gets a fresh page, so modal portals cannot interfere with other cases. */
  scenarios?: readonly string[];
  prepare?: (page: Page, scenario: string) => Promise<void>;
  /** Runs before every observation, including interaction-only chart portal parts. */
  prepareCase?: (page: Page, id: string) => Promise<void>;
}

export async function snapshot(
  page: Page,
  fixture: string,
  mode: Mode,
  scenarioOrPrepareCase: string | ParityOptions["prepareCase"] = "",
  prepareOrExtraProperties?: ParityOptions["prepare"] | readonly string[],
  prepareCase?: ParityOptions["prepareCase"],
  extraProperties: readonly string[] = [],
): Promise<Snapshot> {
  const scenario = typeof scenarioOrPrepareCase === "string" ? scenarioOrPrepareCase : "";
  const prepareObservation =
    typeof scenarioOrPrepareCase === "function" ? scenarioOrPrepareCase : prepareCase;
  await page.goto(`/${fixture}.html?${new URLSearchParams({ mode, scenario })}`, {
    waitUntil: fixture.startsWith("parity-image-block") ? "domcontentloaded" : "load",
  });
  const prepare =
    typeof prepareOrExtraProperties === "function" ? prepareOrExtraProperties : undefined;
  const properties = Array.isArray(prepareOrExtraProperties)
    ? prepareOrExtraProperties
    : extraProperties;
  await prepare?.(page, scenario);
  const cases = page.locator("[data-parity-case]");
  await expect(cases.first()).toBeVisible();
  const ids = await cases.evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-parity-case")!),
  );
  const result: Snapshot = {};
  for (const id of ids) {
    const el = page.locator(`[data-parity-case="${id}"]`);
    // A case may exercise an owned part instead of the outer block, and optionally
    // enter a runtime state first (CodeBlock's copy button). Specs freeze its reset timer.
    const setupClick = await el.getAttribute("data-parity-setup-click");
    if (setupClick) await el.locator(setupClick).click();
    const targetSelector =
      (await el.getAttribute("data-parity-hover-target")) ??
      (await el.getAttribute("data-parity-target"));
    const target = targetSelector ? el.locator(targetSelector).first() : el;
    const take = async (state: State) => {
      await prepareObservation?.(page, id);
      result[`${mode} ${scenario ? `${scenario} ` : ""}${id} ${state}`] = await el.evaluate(
        measure,
        [...PROPERTIES, ...properties],
      );
    };
    await page.mouse.move(0, 0);
    await take("rest");
    await target.hover();
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
  optionsOrPrepareCase: ParityOptions | ParityOptions["prepareCase"] = {},
  extraProperties: readonly string[] = [],
): Promise<void> {
  const options: ParityOptions =
    typeof optionsOrPrepareCase === "function"
      ? { prepareCase: optionsOrPrepareCase }
      : optionsOrPrepareCase;
  const capture = !!process.env["OPENUI_PARITY_CAPTURE"];
  const fixture = `parity-${name}${capture ? "-baseline" : ""}`;
  const current: Snapshot = {};
  for (const mode of ["light", "dark"] as const) {
    for (const scenario of options.scenarios ?? [""]) {
      Object.assign(
        current,
        await snapshot(
          page,
          fixture,
          mode,
          scenario,
          options.prepare,
          options.prepareCase,
          extraProperties,
        ),
      );
    }
  }
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
