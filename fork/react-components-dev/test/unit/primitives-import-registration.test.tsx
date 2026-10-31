// ADR 0002: imported primitives already have every rule their public SSR markup uses.
import { getComponentStyles } from "@openuidev/react-components";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { migratedComponents } from "./contract/components";
import { renderWithPortals, withPortalTarget } from "./contract/portal";

vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  createPortal: (children: ReactNode) => children,
}));

const folders = [
  "IconButton",
  "Buttons",
  "Input",
  "TextArea",
  "Label",
  "FormControl",
  "Select",
  "CheckBoxGroup",
  "CheckBoxItem",
  "RadioGroup",
  "RadioItem",
  "SwitchGroup",
  "SwitchItem",
  "ToggleGroup",
  "ToggleItem",
  "Slider",
  "DatePicker",
  "Calendar",
  "Chips",
  "Tag",
  "IconTag",
  "Separator",
  "Skeleton",
  "DotMatrixLoader",
  "Steps",
  "Tabs",
  "Accordion",
  "Modal",
  "TooltipWrapper",
  "Callout",
  "Carousel",
];
const imported = getComponentStyles();

for (const folder of folders) {
  it(`${folder} registers its styles on import and adds none during server rendering`, () => {
    const entry = migratedComponents.find((component) => component.folder === folder)!;
    // Modal's public fixture opens only when a portal destination exists.
    const elements =
      folder === "Modal" ? withPortalTarget(() => entry.elements()) : entry.elements();
    const html = renderWithPortals(<>{elements}</>);
    const generated = [...html.matchAll(/class="([^"]*)"/g)]
      .flatMap((match) => match[1]!.split(" "))
      .filter((name) => /^go\d+$/.test(name));

    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(imported).toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(getComponentStyles()).toBe(imported);
  });
}
