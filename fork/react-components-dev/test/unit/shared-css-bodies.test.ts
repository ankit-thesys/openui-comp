// The conversion script's report of css bodies a converted module shares with another module
// (#134: TextBlock's tones were byte-identical to Tag's, Sources' cursor rule to Calendar's).
import { expect, it } from "vitest";
import { sharedCssBodies } from "../../scripts/shared-css-bodies.mjs";

const tone = "css`\n      color: var(--openui-text-success-primary);\n    `";
const module = (body: string, extra = "") => `export const styles = { tone: ${body}${extra} };\n`;

it("reports a converted module's body that another module repeats, with both locations", () => {
  const shared = sharedCssBodies(
    [
      { path: "/src/TextBlock/textBlock.styles.ts", text: module(tone) },
      { path: "/src/Tag/tag.styles.ts", text: `\n\n${module(tone)}` },
    ],
    new Set(["/src/TextBlock/textBlock.styles.ts"]),
  );
  expect(shared).toEqual([
    {
      path: "/src/TextBlock/textBlock.styles.ts",
      line: 1,
      others: [{ path: "/src/Tag/tag.styles.ts", line: 3 }],
    },
  ]);
});

it("ignores bodies made component-specific, repeats within one module and unconverted pairs", () => {
  const specific =
    "css`\n      /* TextBlock tone. */\n      color: var(--openui-text-success-primary);\n    `";
  expect(
    sharedCssBodies(
      [
        {
          path: "/src/TextBlock/textBlock.styles.ts",
          text: module(specific, `, again: ${specific}`),
        },
        { path: "/src/Tag/tag.styles.ts", text: module(tone) },
        { path: "/src/IconTag/iconTag.styles.ts", text: module(tone) },
      ],
      new Set(["/src/TextBlock/textBlock.styles.ts"]),
    ),
  ).toEqual([]);
});

it("leaves out bodies with substitutions, whose text can differ per module", () => {
  const substituted = "css`color: ${color};`";
  expect(
    sharedCssBodies(
      [
        { path: "/src/A/a.styles.ts", text: module(substituted) },
        { path: "/src/B/b.styles.ts", text: module(substituted) },
      ],
      new Set(["/src/A/a.styles.ts"]),
    ),
  ).toEqual([]);
});
