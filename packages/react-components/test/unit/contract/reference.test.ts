// Guards the generated selector reference: the committed docs/reference/selectors.md must be
// exactly what the generator produces from the built components' stable names.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readStableNames, renderSelectorReference } from "../../../scripts/selector-reference.mjs";

const committed = () =>
  readFileSync(new URL("../../../docs/reference/selectors.md", import.meta.url), "utf8");

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

  it("matches the committed reference (run `pnpm docs:selectors` after changing names)", async () => {
    expect(committed()).toBe(renderSelectorReference(await readStableNames()));
  });
});
