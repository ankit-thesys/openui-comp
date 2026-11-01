// Guards the generated selector reference: the library's committed docs/reference/selectors.md must be
// exactly what the generator produces from the built components' stable names.
import { library } from "#paths";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readStableNames, renderSelectorReference } from "../../../scripts/selector-reference.mjs";

const committed = () => readFileSync(library("docs/reference/selectors.md"), "utf8");

describe("selector reference", () => {
  it("documents Button from its stable names", async () => {
    const reference = renderSelectorReference(await readStableNames());
    expect(reference).toContain("## Button");
    expect(reference).toContain("## Tabs (TabsList)");
    expect(reference).toContain(
      '| `.openui-tabs-list--variant-icon-title` | Modifier | `variant="iconTitle"` |',
    );
    expect(reference).toContain(
      '| `.openui-button--tone-destructive` | Modifier | `tone="destructive"` |',
    );
  });

  it("documents IconText's boolean modifier as a prop", async () => {
    const reference = renderSelectorReference(await readStableNames());
    expect(reference).toContain("| `.openui-icon-text--bold` | Modifier | `bold={true}` |");
  });

  it("documents inherited Select sizes and boolean modifiers with their public prop names", async () => {
    const reference = renderSelectorReference(await readStableNames());
    expect(reference).toContain('| `.openui-select-content--size-md` | Modifier | `size="md"` |');
    expect(reference).toContain(
      "| `.openui-select-item--show-tick` | Modifier | `showTick={true}` |",
    );
  });

  it("marks shared internals, which keep the name of the module family that owns them", async () => {
    const reference = renderSelectorReference(await readStableNames());
    expect(reference).toContain("| `.openui-border-box` | Root, shared internal | Always |");
    expect(reference).toContain("| `.openui-skeleton-pulse` | Root, shared internal | Always |");
    expect(reference).toContain(
      "| `.openui-chart-tooltip-portal` | Part (`portal`), shared internal |",
    );
    expect(reference).toContain("| `.openui-chart-empty` | Part (`empty`), shared internal |");
    expect(reference).toContain(
      "| `.openui-chart-with-stacked-legend` | Part (`layout`), shared internal |",
    );
    expect(reference).toContain("| `.openui-stacked-legend` | Root | Always |");
  });

  it("never repeats a segment in a stable class", async () => {
    const stutters = (await readStableNames())
      .flatMap(({ names }) => Object.values(names))
      .flatMap((value) => (typeof value === "string" ? [value] : Object.values(value)))
      .filter((name) =>
        name
          .split("--")[0]!
          .split("-")
          .some((segment, i, segments) => segment === segments[i + 1]),
      );
    expect(stutters).toEqual([]);
  });

  it("matches the committed reference (run `pnpm docs:selectors` after changing names)", async () => {
    expect(committed()).toBe(renderSelectorReference(await readStableNames()));
  });
});
