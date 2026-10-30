import { expect, test } from "@playwright/test";
import { classViolation, ruleViolation, rulesOf, selectorsOf } from "../unit/contract/checks";
import { cssFor, stableClassesIn } from "../unit/contract/collect";
import { migrated, openMigrated } from "./bench/migrated";

test("Modal's real portal markup satisfies the class-based contract in both modes", async ({
  page,
}) => {
  const modal = migrated.find(({ folder }) => folder === "Modal")!;
  const collected: string[] = [];
  for (const layer of ["", "openui"]) {
    await openMigrated(page, modal, "", "", true, layer);
    await expect(page.getByRole("dialog")).toHaveCount(3);
    const { html, sheet } = await page.evaluate(async () => {
      const path = "/elements.js";
      const { getComponentStyles } = (await import(path)) as { getComponentStyles: () => string };
      return { html: document.body.innerHTML, sheet: getComponentStyles() };
    });
    const css = cssFor(html, sheet);
    expect(selectorsOf(css).length).toBeGreaterThan(0);
    expect(rulesOf(css).map((rule) => ruleViolation(rule, layer))).toEqual(
      rulesOf(css).map(() => null),
    );
    const stable = [...stableClassesIn(html)].filter(
      (name) => !name.startsWith("openui-theme-portal-"),
    );
    expect(stable.sort()).toEqual([...modal.stableClasses].sort());
    const blocks = new Set(modal.stableClasses.filter((name) => !name.includes("--")));
    expect(stable.map((name) => classViolation(name, blocks))).toEqual(stable.map(() => null));
    collected.push(css);
  }
  const shapes = (sheet: string) =>
    selectorsOf(sheet)
      .map((s) => s.replace(/\bgo\d+\b/g, "go"))
      .sort();
  expect(shapes(collected[1]!)).toEqual(shapes(collected[0]!));
});
