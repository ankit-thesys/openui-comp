import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readStableNames } from "../../scripts/selector-reference.mjs";
import { styleProvenance } from "../../scripts/style-provenance.mjs";
import {
  comparableAll,
  snapshot,
  type Collection,
  type LayerSnapshot,
  type Snapshot,
} from "../css-snapshot/snapshot";
import { classViolation, ruleViolation, rulesOf, selectorsOf } from "../unit/contract/checks";
import {
  blocksIn,
  cssFor,
  generatedClassesOn,
  namesIn,
  stableClassesIn,
} from "../unit/contract/collect";
import { publicKeyframesIn, unsetPrivateVariables } from "../unit/contract/privateNames";
import { clientOnlyContracts, openMigrated } from "./bench/migrated";

test.use({ timezoneId: "UTC" });

const names = (await readStableNames()).map(({ names }) => names);
const documented = namesIn(names);
const blocks = blocksIn(names);
// Layer-mode classes hash differently today, so both scans give them provenance.
const provenance = { ...(await styleProvenance()), ...(await styleProvenance("openui")) };

// Lazily mounted content (markdown, code blocks) can still be rendering when a fixture opens, so
// wait until the markup stops changing; otherwise the two modes can collect different rule sets.
async function settled(page: Page) {
  let previous = "";
  for (let reads = 0; reads < 50; reads++) {
    const html = await page.evaluate(() => document.body.innerHTML);
    if (html === previous) return;
    previous = html;
    await page.waitForTimeout(100);
  }
  throw new Error("The fixture's markup never settled.");
}

async function collect(page: Page) {
  await settled(page);
  return page.evaluate(async () => {
    const path = "/elements.js";
    const { getComponentStyles, proseMarkup } = (await import(path)) as {
      getComponentStyles: () => string;
      proseMarkup: string;
    };
    return { html: document.body.innerHTML, sheet: getComponentStyles(), proseMarkup };
  });
}

// Derived from all contract entries, including focused chart contracts. Requiring every declared
// client-only class below prevents a new part from silently passing on an unopened fixture.
for (const component of clientOnlyContracts) {
  test(`${component.folder}'s client-only parts satisfy the contract in both modes`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.clock.install({ time: new Date("2026-10-15T12:00:00Z") });
    const shapes: string[][] = [];
    const snapshots: Record<string, Snapshot | LayerSnapshot> = {};
    const collections: Record<string, Collection> = {};
    const file = `browser-${component.folder.replaceAll("/", "_")}.json`;
    const baseline = new URL(`../css-snapshot/${file}`, import.meta.url);
    const record = process.env["OPENUI_CSS_RECORD"] === "1";
    for (const layer of ["", "openui"]) {
      const seen = new Set<string>();
      const selectors = new Map<string, number>();
      // Reopen for classes that need mutually exclusive states, such as Calendar's month/year
      // menus, Select's sizes/positions and EditableTable's text editor/select popover.
      for (const target of ["", ...component.clientOnly]) {
        if (target && seen.has(target)) continue;
        await openMigrated(page, component, "", target, true, layer, true);
        if (component.folder === "Tabs") {
          await page.locator(".openui-tabs-scroll-right").first().waitFor();
          await page.locator(".openui-tabs-list").evaluateAll((lists) => {
            for (const list of lists) list.scrollLeft = (list.scrollWidth - list.clientWidth) / 2;
          });
          await page.locator(".openui-tabs-scroll-left").first().waitFor();
        }
        if (target) await expect(page.locator(`.${target}`).first()).toBeAttached();
        if (component.folder === "Modal") await expect(page.getByRole("dialog")).toHaveCount(3);
        const { html, sheet, proseMarkup } = await collect(page);
        const css = cssFor(html, sheet);
        const key = target || "initial";
        const collection = {
          html: html.replace(/\sopenui-theme-portal-[^"\s]+/g, ""),
          sheet,
        };
        const { markup, ...rest } = snapshot(collection, provenance);
        // Layer samples keep rules and order only; see LayerSnapshot.
        if (layer) snapshots[`${layer}/${key}`] = rest;
        else {
          collections[`${component.folder}/${key}`] = collection;
          snapshots[key] = { markup, ...rest };
        }
        expect(selectorsOf(css).length).toBeGreaterThan(0);
        const proseRoots = generatedClassesOn(proseMarkup, "openui-markdown-renderer");
        expect(
          rulesOf(css)
            .map((rule) => [rule.selector, ruleViolation(rule, layer, { proseRoots })])
            .filter(([, reason]) => reason !== null),
        ).toEqual([]);
        const stable = [...stableClassesIn(html)].filter(
          (name) => !name.startsWith("openui-theme-portal-"),
        );
        if (component.folder === "Modal")
          expect([...stable].sort()).toEqual([...component.stableClasses].sort());
        expect(stable.filter((name) => !documented.has(name))).toEqual([]);
        expect(stable.map((name) => classViolation(name, blocks))).toEqual(stable.map(() => null));
        expect(unsetPrivateVariables(css, sheet + html, documented)).toEqual([]);
        if (!component.chart) expect(publicKeyframesIn(css)).toEqual([]);
        for (const name of stable) seen.add(name);
        // Union samples by their actual selectors, retaining repeated rules in the sheet.
        // Normalize generated names only at comparison, so distinct classes keep their weight.
        const counts = new Map<string, number>();
        for (const selector of selectorsOf(css))
          counts.set(selector, (counts.get(selector) ?? 0) + 1);
        for (const [selector, count] of counts)
          selectors.set(selector, Math.max(count, selectors.get(selector) ?? 0));
      }
      expect(component.clientOnly.filter((name) => !seen.has(name))).toEqual([]);
      expect(component.stableClasses.filter((name) => !seen.has(name))).toEqual([]);
      shapes.push(
        [...selectors]
          .flatMap(([selector, count]) =>
            Array.from({ length: count }, () => selector.replace(/\bgo\d+\b/g, "go")),
          )
          .sort(),
      );
    }
    // Hand the raw collections to the order report before comparing, so it runs on a failure too.
    const capture = process.env["OPENUI_CSS_CAPTURE"];
    if (capture) {
      mkdirSync(capture, { recursive: true });
      writeFileSync(`${capture}/${file}`, JSON.stringify(collections));
    }
    expect(shapes[1]).toEqual(shapes[0]);
    if (record) writeFileSync(baseline, JSON.stringify(snapshots, null, 2) + "\n");
    else {
      expect(
        snapshots,
        `${component.folder}: client-only CSS/markup changed; baseline must be recorded before migration`,
      ).toEqual(comparableAll(JSON.parse(readFileSync(baseline, "utf8")), component.folder));
    }
  });
}
